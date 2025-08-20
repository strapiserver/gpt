import { readFileSync } from "fs";
import { IExchangerData, IScrapedBC } from "../types";
import callStrapi from "../services/callStrapi";
import {
  CreateExchangerBC,
  LinksQuery,
  UpdateExchangerName,
} from "../services/queries";
import { delay, mylog } from "../helper";
import { generateRating } from "../descriptions/helper";
import { splitReadable } from "./helper";

export const changeExchangerNames = async () => {
  await delay(1500);
  const data = await callStrapi(LinksQuery);
  const exData = data.exchangers.filter(
    (e: any) => e.ref_link
  ) as IExchangerData[];

  for (const ex of exData) {
    const { name, id } = ex;

    const newName = splitReadable(name);

    await callStrapi(UpdateExchangerName, { id, name: newName }).then(() => {});
    mylog(`Updated name for ${name} -> ${newName}`, "hidden");
    await delay(400);
  }
  mylog("FINISHED name update", "important");
};
