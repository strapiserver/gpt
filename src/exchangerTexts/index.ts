import axios from "axios";
import * as cheerio from "cheerio";
import { writeMyFile } from "../fileHandler";

const exchangers = [
  "https://16tonn.com",
  // "https://100btc.kiev.ua",
  // Add more exchanger URLs here
];

function isSimilarText(
  existingTexts: string[],
  newText: string,
  threshold: number = 0.5
): boolean {
  return existingTexts.some((existingText) => {
    const words1 = new Set(existingText.split(" "));
    const words2 = new Set(newText.split(" "));
    const commonWords = [...words1].filter((word) => words2.has(word)).length;
    const similarity = commonWords / Math.max(words1.size, words2.size);
    return similarity > threshold;
  });
}

async function fetchTextBlocks(url: string) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const textBlocks: { tag: string; text: string }[] = [];

    $("body *").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      if (
        text.length > 20 &&
        !isSimilarText(
          textBlocks.map((tb) => tb.text),
          text
        )
      ) {
        textBlocks.push({ tag: element.tagName, text });
      }
    });

    console.log(`Extracted text blocks from ${url}:`, textBlocks.length);
    writeMyFile("./db-exchangers.json", JSON.stringify(textBlocks));
    return;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return [];
  }
}

async function run() {
  for (const exchanger of exchangers) {
    await fetchTextBlocks(exchanger);
  }
}

// let rawResult: string | null = null;
// let articleData: IArticleData | undefined;
// let attempts = 0;
// const maxRetries = 3;

// while (attempts < maxRetries) {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: prompt }],
//     });

//     rawResult = completion?.choices?.[0]?.message?.content;

//     if (rawResult) {
//       articleData = JSON.parse(rawResult)[locale] as IArticleData;
//       console.log(`📗 \u001b[1;32m ${pmName} successfully parsed!`);
//       break; // ✅ Success, exit retry loop
//     } else {
//       console.log(
//         `📕 \u001b[1;31m ${pmName} returned an empty response.`
//       );
//     }
//   } catch (error) {
//     console.error(
//       `⚠️ Error processing ${pmName} (Attempt ${
//         attempts + 1
//       } of ${maxRetries}):`,
//       error
//     );
//   }

//   attempts++;
//   if (attempts < maxRetries) {
//     console.log(`🔄 Retrying in 5 seconds...`);
//     await sleep(5000);
//   }
// }

// if (articleData) {
//   db.push(`.${sectionName}.${pmName}`, articleData);
//   db.save();
//   createArticle(pmName, locale, articleData);
//   results.push({ pmName, articleData });
//   console.log(`🔄 Continuing in 20 seconds...`);
//   await sleep(20000);
// } else {
//   console.log(`❌ ${pmName} failed after ${maxRetries} attempts.`);
// }

run();
