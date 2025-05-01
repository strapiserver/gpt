import callStrapi from "../services/callStrapi";
import { LinksQuery } from "../services/queries";
import { IExchangerData, IScrapedBC } from "../types";
import {
  getEnding,
  getFinalUrl,
  getPossibleEndingsXML,
  getRepeatedStrings,
  removeSame,
} from "./helper";

import { mylog, saveProgress } from "../helper";
import { readFileSync } from "fs";

export const findxml = async () => {
  const data = await callStrapi(LinksQuery);
  const exData = data.exchangers.filter(
    (e: any) => e.ref_link
  ) as IExchangerData[];

  const possibleEndings = getPossibleEndingsXML(exData);
  console.log("possible endings:", possibleEndings);

  const bc = JSON.parse(
    readFileSync("bc-real-links.json", "utf-8")
  ) as IScrapedBC[];

  fillXML(bc, possibleEndings);
};

async function fillXML(bc: IScrapedBC[], possibleEndings: string[]) {
  //let results = {} as { [key: string]: string };
  const starts = ["", "api."];

  for (const [index, exchanger] of bc.entries()) {
    if (!exchanger.real_link) continue;
    // mylog(`Checking ${index} out of ${exchangerLinks.length} ...`, "info");
    for (let ending of possibleEndings) {
      for (let start of starts) {
        let xml =
          "https://" +
          (exchanger.real_link.replace("https://", start) + ending).replace(
            "//",
            "/"
          );
        mylog("checking url: " + xml, "hidden");
        try {
          let response = await fetch(xml, { method: "HEAD" });
          if (response.ok) {
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("xml")) {
              mylog(`${index}: ${xml}`, "success");

              exchanger.xml = xml;
              saveProgress(bc, "bc-xml.json");
              const found = bc.filter((e) => e.xml).length;
              mylog(
                `Found ${found}, skipped ${index - found} out of ${bc.length}`,
                "important"
              );
              break; // Stop checking other endings for this exchanger link
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  }

  mylog("-- FINISHED --", "warning");
}
