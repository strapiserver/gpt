import { readFileSync } from "fs";
import { IExchangerData, IScrapedBC } from "../types";
import callStrapi from "../services/callStrapi";
import { CreateExchangerBC, LinksQuery } from "../services/queries";

import { generateRating } from "../descriptions";
import { delay, mylog } from "../helper";
import { cl } from "../xml/helper";

export const createExchangers = async () => {
  let exist = 0;
  const data = await callStrapi(LinksQuery);
  const exData = data.exchangers.filter(
    (e: any) => e.ref_link
  ) as IExchangerData[];

  const bc = JSON.parse(readFileSync("bc-xml.json", "utf-8")) as IScrapedBC[];

  for (const [index, exchanger] of bc.entries()) {
    const { name, real_link, xml, card } = exchanger;
    const exists = exData.filter((e) => {
      const match =
        e.ref_link === real_link ||
        e.rates_link === xml ||
        e.name.toLowerCase() == name.toLowerCase();
      return match;
    });
    await delay(1500 * index);
    if (exists.length) {
      exist += 1;
      mylog(`${bc.length - index} Exists: ${name}`, "hidden");
      continue;
    }

    const data = {
      name,
      status: "suspended",
      rates_link: xml || null,
      ref_link: real_link,
      admin_rating: generateRating(),
      bc_card_link: card || null,
    };

    await callStrapi(CreateExchangerBC, data).then(() => {
      mylog(`${bc.length - index} Created exchanger ${name}`, "hidden");
    });
  }
  mylog("FINISHED", "important");
  mylog(
    `Exists: ${exist}, New: ${bc.length - exist}, Total: ${
      bc.length - exist + exData.length
    }`
  );
};
