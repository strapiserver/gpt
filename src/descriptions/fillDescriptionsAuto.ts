import { IExchangerData } from "../types";
import callStrapi from "../services/callStrapi";
import { mylog } from "../helper";
import { DescriptionQuery, UpdateDescriptions } from "../services/queries";
import { callGPT, findPrompt } from "../services/gpt";
import { scrape } from "../services/cheerio";
import { generateRating } from "./helper";

export const fillDescriptionsAuto = async () => {
  try {
    const promptDescription = await findPrompt("exchanger_description");
    const data = await callStrapi(DescriptionQuery);

    const exchangers = data.exchangers.filter(
      (e: any) => e.ref_link
    ) as IExchangerData[];
    mylog(`Exchangers without description found: ${exchangers.length}`);

    for (let e of exchangers) {
      const textBlocks = await scrape(e.ref_link);
      if (textBlocks) {
        const prompt = promptDescription + " " + textBlocks;
        const res = (await callGPT(prompt, e.id)) as any;

        mylog(` ✅  ---------------------------`);
        mylog(`  Blocks: ${textBlocks.length}`, "success");
        mylog(` ✅  ___________________________`);

        if (res) {
          const updateData = {
            id: e.id,
            ru_description: res.ru_description || null,
            en_description: res.en_description || null,
            telegram: res.telegram || null,
            email: res.email || null,
            working_time: res.working_time || null,
            admin_rating: generateRating(),
          };
          await callStrapi(UpdateDescriptions, updateData);
          mylog(`${e.id} filled!`, "warning");
          continue;
        }
      }
    }
  } catch (err) {
    console.error(" loadExchangersHTML:", err);
  }
};
