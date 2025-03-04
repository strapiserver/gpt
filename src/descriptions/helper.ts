import OpenAI from "openai";
import db from "../db";
import { sleep, createArticle } from "../helper";
import { IArticleData, IExchangerData } from "../types";
import dotenv from "dotenv";

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

export const callGPT = async ({
  prompt,
  exchangerId,
}: {
  prompt: string;
  exchangerId: string;
}) => {
  let rawResult: string | null = null;
  let exchangerData: IExchangerData | null = null;

  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      rawResult = completion?.choices?.[0]?.message?.content;

      if (rawResult) {
        //   exchangerData = JSON.parse(rawResult) as IExchangerData;
        console.log(`📗 \u001b[1;32m ${rawResult}`);
        break; // ✅ Success, exit retry loop
      } else {
        console.log(
          `📕 \u001b[1;31m ${exchangerId} returned an empty response.`
        );
      }
    } catch (error) {
      console.error(
        `⚠️ Error processing ${exchangerId} (Attempt ${
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

  if (exchangerData) {
    // db.push(`.${sectionName}.${pmName}`, articleData);
    // db.save();
    // createArticle(pmName, locale, articleData);
    // results.push({ pmName, articleData });
    console.log(exchangerData);
    console.log(`🔄 Continuing in 20 seconds...`);
    await sleep(20000);
  } else {
    console.log(`❌ ${exchangerId} failed after ${maxRetries} attempts.`);
  }
};

export const trimTextValues = (
  arr: { tag: string; text: string }[]
): { tag: string; text: string }[] => {
  return arr.map((item) => ({
    tag: item.tag,
    text: item.text.slice(0, 4000),
  }));
};
