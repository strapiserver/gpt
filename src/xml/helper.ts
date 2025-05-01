import { https, http } from "follow-redirects";
import { IExchangerData } from "../types";

// Helper: wait for ms

// Sequentially fetch final URLs with 200s delay between each

export function getFinalUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res: any) => {
      resolve(res.responseUrl || url);
    });

    req.setTimeout(10_000, () => {
      req.destroy();
      reject(new Error(`Timeout after 200 seconds for ${url}`));
    });
    req.on("error", reject);
  });
}

// Wait utility

export const getPossibleEndingsXML = (exchangers: IExchangerData[]) => {
  let endings = [] as string[]; // ["/exchangerates"]

  for (let exchanger of exchangers) {
    const { rates_link, name } = exchanger;

    const ending = getEnding(rates_link);
    endings = [...endings, ending];
  }

  return ["", ...getRepeatedStrings(endings.filter((s) => s.length > 2))];
};

export const getEnding = (link: string) => {
  const domain = link
    .replace(/https?:\/\/(www\.)?/i, "___")
    .split("/")[0]
    .replace("api.", "")
    .replace("___", "");

  return link.split(domain)[1].split("?")[0];
};

export const getDomain = (link: string) => {
  return link
    .replace(/https?:\/\/(www\.)?/i, "")
    .split("/")[0]
    .substring(0, 100);
};

export const cl = (link?: string) => {
  link?.replace(/https?:\/\/(www\.)?/i, "___").split("/")[0];
};

export function getRepeatedStrings(arr: string[]): string[] {
  const count: Record<string, number> = {};
  const result: string[] = [];

  for (const str of arr) {
    count[str] = (count[str] || 0) + 1;
  }

  for (const str in count) {
    if (count[str] > 1) {
      result.push(str);
    }
  }

  return result;
}

export function removeSame(source: string[], toRemove: string[]): string[] {
  const toRemoveSet = new Set(toRemove);
  return source.filter((item) => !toRemoveSet.has(item));
}
