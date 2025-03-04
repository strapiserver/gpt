import axios from "axios";
import * as cheerio from "cheerio";
import { writeMyFile } from "../fileHandler";
import { run } from "node:test";

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
export async function fetchTextBlocks(url: string) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const textBlocks: { tag: string; text: string; href?: string }[] = [];

    $("body *").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      const tag = element.tagName;

      // Extract links if it's an <a> tag
      const href = tag === "a" ? $(element).attr("href") || "" : undefined;

      if (
        text.length > 20 &&
        !isSimilarText(
          textBlocks.map((tb) => tb.text),
          text
        )
      ) {
        textBlocks.push({ tag, text, ...(href ? { href } : {}) });
      }
    });

    console.log(`Extracted text blocks from ${url}:`, textBlocks.length);

    return textBlocks;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}
