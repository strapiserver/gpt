import { delay, mylog } from "../helper";
import callStrapi from "../services/callStrapi";
import { findPrompt, callGPT } from "../services/gpt";
import { LinksQuery, UpdateDescriptions } from "../services/queries";
import { IExchangerData } from "../types";
import { getDomain } from "../xml/helper";
import { generateRating, readHtmlFiles } from "./helper";

export default async () => {
  const fileData = (await readHtmlFiles()) as
    | { fileName: string; content: string }[]
    | undefined;

  if (!fileData) {
    mylog("no data", "error");
    return;
  }

  const data = (await callStrapi(LinksQuery)) as {
    exchangers: IExchangerData[];
  };
  const exData = data.exchangers.filter((e) => e.ref_link);
  const promptDescription = await findPrompt("exchanger_description");

  for (const data of fileData) {
    const ex = exData.find(
      (e) =>
        getDomain(e.ref_link) == data.fileName.replace(".html", "") ||
        getDomain(data.fileName).split(".")[0] == e.name.toLowerCase()
    );
    mylog(`For ${data.fileName} found ${ex?.name}`, "hidden");

    if (!ex) {
      mylog(`${data.fileName}`, "error");
      continue;
    }

    const textBlocks = data.content;

    if (textBlocks) {
      const prompt = promptDescription + " " + textBlocks.slice(0, 28_000);
      const res = (await callGPT(prompt, ex.id, "gpt-4.1")) as any;

      mylog(` ✅  ---------------------------`);
      mylog(`  Blocks: ${textBlocks.length}`, "success");
      mylog(` ✅  ___________________________`);

      if (res) {
        const updateData = {
          id: ex.id,
          ru_description: res.ru_description || null,
          en_description: res.en_description || null,
          telegram: res.telegram || null,
          email: res.email || null,
          working_time: res.working_time || null,
          admin_rating: generateRating(),
        };

        await callStrapi(UpdateDescriptions, updateData);
        mylog(`${ex.id} ${ex.name} filled!`, "success");
        await delay(60000);
      } else {
        mylog(`Failed: ${ex.id} ${ex.name}`);
        await delay(60000);
      }
    }
  }
  mylog("- DONE -", "success");
};
