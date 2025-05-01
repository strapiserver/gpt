import axios from "axios";
import * as cheerio from "cheerio";
import { mylog } from "../helper";
import {
  cleanHtmlForExtraction,
  hasRepeatedSubstrings,
  isRatesWastedString,
  isSimilarText,
  trimTextValues,
} from "../descriptions/helper";

export async function scrape(
  url: string,
  needTrim: boolean = true,
  id?: string,
  html?: string
) {
  try {
    const { data } = html ? { data: html } : await axios.get(url);
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

    const filtered = textBlocks.filter(
      (tb) => !isRatesWastedString(tb.text) || !hasRepeatedSubstrings(tb.text)
    );

    return cleanHtmlForExtraction(
      JSON.stringify(needTrim ? trimTextValues(filtered) : filtered)
    );
  } catch (error) {
    mylog(`${url}`, "error");
    return "";
  }
}
