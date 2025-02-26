import Fastify from "fastify";
import dotenv from "dotenv";
import auth from "./services/auth";
import callStrapi from "./services/callStrapi";
import {
  PmGroupsQuery,
  PromptsQuery,
  LinksQuery,
  UpdateRefLinks,
  DeleteExchanger,
} from "./services/queries";
import { IArticleData, IPrompt } from "./types";
import OpenAI from "openai";
import db from "./db";
import { ISection } from "./types/selector";
import { createArticle, getPmNames, makeRefLink, sleep } from "./helper";
import { create } from "domain";
import { empty } from "cheerio/dist/commonjs/api/manipulation";

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

const server = Fastify({
  logger: true,
});

server.get("/", async (req: any, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  const data = db.getData(".");
  const { jwt, ...rest } = data;
  reply.send(JSON.stringify(rest));
});

server.get("/fillrefs", async (req: any, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  const data = await callStrapi(LinksQuery);
  const empty = data.exchangers.filter((e: any) => !e.ref_link);
  const withRefLinks = empty.map((e: any) => ({
    ...e,
    ref_link: makeRefLink(e.rates_link),
  }));
  for (let e of withRefLinks) {
    await callStrapi(DeleteExchanger, { id: e.id });
    console.log(`deleted ${e.id}`);
    await sleep(800);
  }
  reply.send(JSON.stringify(withRefLinks));
});

server.get("/section=:sectionName", async function (request, reply) {
  reply.header("Access-Control-Allow-Origin", "*");
  try {
    const { sectionName } = request.params as { sectionName: string };
    const promptData = (await callStrapi(PromptsQuery)) as {
      prompts: IPrompt[];
    };
    const pmGroupsData = await callStrapi(PmGroupsQuery);
    const sections = pmGroupsData?.selector?.sections as ISection[];
    const section = sections.filter(
      (s) => s.en_title.toLowerCase() === sectionName.toLowerCase()
    );

    const pmNames = getPmNames(section);

    const promptDescription =
      sectionName &&
      promptData?.prompts?.find(
        (p) => p.code.toLowerCase() == sectionName.toLowerCase()
      )?.description;

    if (!sectionName || !promptDescription) {
      return reply.send({
        error: "Invalid or missing code",
        sectionName,
        promptDescription,
      });
    }

    const results: any[] = [];

    for (const pmName of pmNames) {
      for (const locale of ["en", "ru"]) {
        console.log(pmName, locale);
        const promptHeader = `Write an article about ${sectionName} ${pmName}.`;
        const promptFooter = JSON.stringify(pmNames);
        const prompt = `${promptHeader} ${promptDescription} ${promptFooter}`;
        console.log("________________");
        console.log("NAME: ", pmName);
        console.log("PROMPT: ", prompt);

        let rawResult: string | null = null;
        let articleData: IArticleData | undefined;
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [{ role: "user", content: prompt }],
            });

            rawResult = completion?.choices?.[0]?.message?.content;

            if (rawResult) {
              articleData = JSON.parse(rawResult)[locale] as IArticleData;
              console.log(`📗 \u001b[1;32m ${pmName} successfully parsed!`);
              break; // ✅ Success, exit retry loop
            } else {
              console.log(
                `📕 \u001b[1;31m ${pmName} returned an empty response.`
              );
            }
          } catch (error) {
            console.error(
              `⚠️ Error processing ${pmName} (Attempt ${
                attempts + 1
              } of ${maxRetries}):`,
              error
            );
          }

          attempts++;
          if (attempts < maxRetries) {
            console.log(`🔄 Retrying in 5 seconds...`);
            await sleep(5000);
          }
        }

        if (articleData) {
          db.push(`.${sectionName}.${pmName}`, articleData);
          db.save();
          createArticle(pmName, locale, articleData);
          results.push({ pmName, articleData });
          console.log(`🔄 Continuing in 20 seconds...`);
          await sleep(20000);
        } else {
          console.log(`❌ ${pmName} failed after ${maxRetries} attempts.`);
        }
      }
    }

    return reply.send({ success: true, results });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return reply.status(500).send({ error: "Failed to generate text" });
  }
});
const port = +process.env.PORT!;
console.log("port is: ", port);

// Run the server!
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
    await auth();
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};
start();
