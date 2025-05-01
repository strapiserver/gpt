import { JSDOM } from "jsdom";

export const trimTextValues = (
  arr: { tag: string; text: string }[]
): { tag: string; text: string }[] => {
  return arr.map((item) => ({
    tag: item.tag,
    text: item.text.slice(0, 6000),
  }));
};

export function isSimilarText(
  existingTexts: string[],
  newText: string,
  threshold: number = 0.7
): boolean {
  return existingTexts.some((existingText) => {
    const words1 = new Set(existingText.split(" "));
    const words2 = new Set(newText.split(" "));
    const commonWords = [...words1].filter((word) => words2.has(word)).length;
    const similarity = commonWords / Math.max(words1.size, words2.size);
    return similarity > threshold;
  });
}

export function cleanHtmlForExtraction(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove unwanted tags
  const tagsToRemove = ["script", "style", "meta", "noscript", "head", "svg"];
  tagsToRemove.forEach((tag) => {
    document.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // Remove hidden elements
  document
    .querySelectorAll('[style*="display:none"], [style*="visibility:hidden"]')
    .forEach((el) => el.remove());

  // Get only visible text
  const rawText = document.body?.textContent || "";

  // Normalize whitespace
  const cleanedText = rawText
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .replace(/[\t\r\n]+/g, "\n") // preserve line breaks for structure
    .replace(/\n{2,}/g, "\n\n") // collapse multiple newlines
    .trim();

  return cleanedText;
}

export function isRatesWastedString(input: string): boolean {
  const cleaned = input.replace(/\s+/g, "").replace(".", "");
  const hasLargeNumber = /\d{5,}/.test(cleaned);
  return hasLargeNumber && cleaned.length < 400;
}

export function hasRepeatedSubstrings(input: string): boolean {
  const counts = new Map<string, number>();
  const minLen = 8;

  for (let len = minLen; len <= input.length; len++) {
    for (let i = 0; i <= input.length - len; i++) {
      const substr = input.slice(i, i + len);
      if (substr.includes(" ")) continue; // optional: skip multi-word slices if needed
      const count = counts.get(substr) || 0;
      if (count === 1) counts.set(substr, 2); // found repeat
      else if (count > 1) counts.set(substr, count + 1);
      else counts.set(substr, 1);
    }
  }

  let repeated = 0;
  for (const [substr, count] of counts) {
    if (substr.length >= 8 && count > 1) {
      repeated++;
      if (repeated > 9) return true;
    }
  }

  return false;
}
