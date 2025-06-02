import { mylog } from "../helper";
import callStrapi from "../services/callStrapi";
import { initParserFetcher } from "../services/parserFetcher";
import { selectorQuery } from "../services/queries";
import { ISelector } from "../types/selector";
import { getPms, getSlugs } from "./pms";

export default async () => {
  mylog("Starting fillDirs...");
  const parserFetcher = initParserFetcher();
  const possiblePairs = (await parserFetcher("possible_pairs")) as Record<
    string,
    string[]
  >;
  mylog("Possible pairs fetched successfully", "success");
  const pairs = Object.entries(possiblePairs).map(([key, value]) => ({
    from: key,
    to: value,
  }));
  mylog(`Found ${pairs.length} pairs`, "info");

  const dirs = Object.entries(possiblePairs).flatMap(([code, pairs]) =>
    pairs.map((pair) => `${code}_${pair}`)
  );
  const { selector } = (await callStrapi(selectorQuery)) as {
    selector: ISelector;
  };

  mylog("selector fetched successfully", "success");
  mylog(`Found ${selector.sections.length} selector sections`, "info");
  mylog(`Found ${dirs.length} dirs`, "info");

  const pms = getPms(selector);
  mylog(`Found ${pms.length} pms`, "info");

  const slugs = getSlugs(dirs, pms);
  mylog(`Found ${Object.keys(slugs).length} slugs`, "info");

  return slugs;
};
