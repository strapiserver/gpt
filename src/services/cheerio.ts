import axios from "axios";
import * as cheerio from "cheerio";
import { mylog } from "../helper";

export const trimTextValues = (
  arr: { tag: string; text: string }[]
): { tag: string; text: string }[] => {
  return arr.map((item) => ({
    tag: item.tag,
    text: item.text.slice(0, 4000),
  }));
};

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
export async function scrape(
  url: string,
  needTrim: boolean = true,
  id?: string
) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const textBlocks: { tag: string; text: string; href?: string }[] = [];
    const root = id ? $(`#${id}`) : $("body");

    function traverse(element: any) {
      if (element.type !== "tag") return;

      const tag = element.tagName;
      const el = $(element);
      const text = el.text().replace(/\s+/g, " ").trim();
      const href = el.attr("href");

      const isAnchor = tag === "a";

      if (isAnchor && href) {
        // Always collect links, even if text is empty or short
        textBlocks.push({
          tag,
          text, // Might be empty, that’s okay
          href,
        });
      } else if (
        text.length > 20 &&
        !isSimilarText(
          textBlocks.map((tb) => tb.text),
          text
        )
      ) {
        textBlocks.push({ tag, text });
      }

      el.children().each((_, child) => traverse(child));
    }

    traverse(root[0]);

    mylog("scraped successfully: " + textBlocks.length, "success");
    return JSON.stringify(needTrim ? trimTextValues(textBlocks) : textBlocks);
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return "";
  }
}
