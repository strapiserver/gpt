import { IExchangerData, IPrompt } from "../types";
import callStrapi from "../services/callStrapi";
import { sleep } from "../helper";
import {
  PromptsQuery,
  LinksQuery,
  UpdateDescriptions,
} from "../services/queries";
import { callGPT, findPrompt } from "../services/gpt";

import { scrape } from "../services/cheerio";

export const generateRating = () =>
  +(Math.random() * (5 - 3.4) + 3.4).toFixed(2);

export const filldescriptions = async () => {
  try {
    const promptDescription = await findPrompt("exchanger_description");

    const data = await callStrapi(LinksQuery);
    const exchangers = data.exchangers.filter(
      (e: any) => e.ref_link
    ) as IExchangerData[];
    console.log(`Exchangers without description found: ${exchangers.length}`);

    for (let e of exchangers) {
      const textBlocks = await scrape(e.ref_link);
      if (textBlocks) {
        const prompt = promptDescription + " " + textBlocks;
        const res = (await callGPT(prompt, e.id)) as any;

        console.log(` ✅ \u001b[1;32m ---------------------------`);
        console.log(` ✅ \u001b[1;32m Blocks: ${textBlocks.length}`);
        console.log(` ✅ \u001b[1;32m ___________________________`);

        if (res) {
          const data = {
            id: e.id,
            ru_description: res.ru_description || null,
            en_description: res.en_description || null,
            telegram: res.telegram || null,
            email: res.email || null,
            working_time: res.working_time || null,
            admin_rating: generateRating(),
          };

          await callStrapi(UpdateDescriptions, data);
          console.log(`📙 \u001b[1;33m ${e.id} filled!`);
        }
        // reply.send(JSON.stringify(res));
      }
      await sleep(5000);
    }
  } catch (err) {
    console.log(err);
  }
};
