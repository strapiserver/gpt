import puppeteer, { Browser } from "puppeteer";
import OpenAI from "openai";
import db from "../db";
import { sleep, createArticle } from "../helper";
import { IArticleData, IDescriptionData } from "../types";
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
  let exchangerData: IDescriptionData | null = null;

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
        const json = JSON.parse(rawResult) as IDescriptionData;
        return json;
        break; // ✅ Success, exit retry loop
      } else {
        console.log(`📕 \u001b[1;31m ${exchangerId} error`);
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
  arr: { tag: string; text: string }[] | null | undefined
): { tag: string; text: string }[] => {
  if (!Array.isArray(arr)) {
    console.error("trimTextValues received non-array input:", arr);
    return []; // Return an empty array to prevent errors
  }

  return arr.map((item) => ({
    tag: item.tag,
    text: item.text.slice(0, 4000),
  }));
};

export const generateRating = () =>
  +(Math.random() * (5 - 3.4) + 3.4).toFixed(2);

export async function fetchWithPuppeteer(
  browser: Browser,
  url: string
): Promise<string | null> {
  try {
    console.log("fetching ", url);
    const page = await browser.newPage();

    // Set a real User-Agent and headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.google.com/",
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for JavaScript-rendered content (if necessary)
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Replacing waitForTimeout

    const content = await page.evaluate(() => document.body.innerText);
    await page.close();

    return content;
  } catch (error) {
    console.error(`❌ Error fetching ${url}: ${(error as Error).message}`);
    return null;
  }
}
