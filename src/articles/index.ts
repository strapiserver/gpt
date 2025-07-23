import { OpenAI } from "openai";
import {
  createArticle,
  createLocalization,
  getPmNames,
  mylog,
  sleep,
} from "../helper";
import { ISection } from "../types/selector";
import dotenv from "dotenv";
import callStrapi from "../services/callStrapi";
import {
  PmGroupsQuery,
  PromptsQuery,
  LinksQuery,
  articleCodesQuery,
} from "../services/queries";
import { IArticleData, IArticleGPT, IPrompt } from "../types";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

if (!OPENAI_API_KEY) {
  throw new Error(
    "OpenAI API key is missing. Please set OPENAI_API_KEY in .env."
  );
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const fillArticles = async (sectionName: string) => {
  try {
    const pmGroupsData = await callStrapi(PmGroupsQuery);
    const sections = pmGroupsData?.selector?.sections as ISection[];
    const section = sections.filter(
      (s) => s.en_title.toLowerCase() === sectionName.toLowerCase()
    );

    // фильтруем уже созданные артиклы
    const resRu = (await callStrapi(articleCodesQuery, { locale: "ru" })) as {
      articles: { code: string }[];
    };
    const resEn = (await callStrapi(articleCodesQuery, { locale: "en" })) as {
      articles: { code: string }[];
    };
    const articleCodesRu = resRu.articles.map((article) => article.code);
    const articleCodesEn = resEn.articles.map((article) => article.code);
    if (articleCodesRu.length !== articleCodesEn.length)
      mylog("Article codes mismatch between ru and en", "error");
    const pmNames = getPmNames(section);
    const pmNamesFiltered = pmNames.filter(
      (name) => !articleCodesRu.includes(name) && !articleCodesEn.includes(name)
    );

    const promptData = (await callStrapi(PromptsQuery)) as {
      prompts: IPrompt[];
    };
    const promptDescription =
      sectionName &&
      promptData?.prompts?.find(
        (p) => p.code.toLowerCase() == sectionName.toLowerCase()
      )?.description;

    if (!sectionName || !promptDescription) {
      mylog(
        JSON.stringify({
          error: "Invalid or missing code",
          sectionName,
          promptDescription,
        }),
        "warning"
      );
    }

    for (const pmName of pmNamesFiltered) {
      const promptHeader = `Write an article about ${sectionName} ${pmName}.`;
      const promptFooter = JSON.stringify(pmNames);
      const prompt = `${promptHeader} ${promptDescription} ${promptFooter}`;
      console.log("________________");
      console.log("NAME: ", pmName);

      let rawResult: string | null = null;
      let articleData: IArticleGPT | undefined;
      let attempts = 0;
      const maxRetries = 3;

      while (attempts < maxRetries) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4.1",
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
          });

          rawResult = completion?.choices?.[0]?.message?.content;

          if (rawResult) {
            articleData = JSON.parse(rawResult) as IArticleGPT;

            if (!articleData.ru.header || !articleData.en.header) {
              mylog(
                `❌ \u001b[1;31m ${pmName} is missing ru or en data: ${JSON.stringify(
                  articleData
                )}`,
                "error"
              );
              articleData = undefined; // Reset articleData if it's incomplete
            }
            mylog(`📗 \u001b[1;32m ${pmName} successfully created!`, "success");
            break; // ✅ Success, exit retry loop
          } else {
            mylog(`${pmName} returned an empty response.`, "error");
          }
        } catch (error) {
          mylog(
            `⚠️ Error processing ${pmName} (Attempt ${
              attempts + 1
            } of ${maxRetries}): ${error}`,
            "error"
          );
        }

        attempts++;
        if (attempts < maxRetries) {
          mylog(`🔄 Retrying in 1 seconds...`);
          await sleep(1000);
        }
      }

      if (articleData && articleData.ru.header && articleData.en.header) {
        const articleEn = await createArticle(pmName, "en", articleData.en); // base article
        await sleep(3000);
        if (articleEn?.createArticle.id) {
          const maxLocaleRetries = 3;
          let localeAttempts = 0;
          let localizationCreated = false;

          while (localeAttempts < maxLocaleRetries && !localizationCreated) {
            try {
              await createLocalization(
                articleEn.createArticle.id,
                "ru",
                articleData.ru
              );
              localizationCreated = true;
            } catch (err) {
              localeAttempts++;
              mylog(
                `⚠️ Failed to create 'ru' localization for ${pmName} (Attempt ${localeAttempts}/${maxLocaleRetries}): ${err}`,
                "error"
              );
              if (localeAttempts < maxLocaleRetries) {
                mylog(`🔄 Retrying localization in 1 second...`);
                await sleep(1000);
              }
            }
          }

          if (!localizationCreated) {
            mylog(
              `❌ Failed to create 'ru' localization for ${pmName} after ${maxLocaleRetries} attempts.`,
              "error"
            );
            // Optional: fallback to creating as a base article instead of localization
            await createArticle(pmName, "ru", articleData.ru);
          }
        } else {
          mylog(
            `❌ Failed to create article for ${pmName} in 'en'. ID: ${articleEn?.createArticle.id}`,
            "error"
          );
          await createArticle(pmName, "ru", articleData.ru);
        }

        await sleep(1000);
      } else {
        mylog(`❌ ${pmName} failed after ${maxRetries} attempts.`, "error");
      }
    }

    return;
  } catch (error) {
    console.error("Failed to generate text. Error calling OpenAI API:", error);
    return;
  }
};
