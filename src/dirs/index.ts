import { delay, mylog } from "../helper";
import callStrapi from "../services/callStrapi";
import { callGPT, findPrompt } from "../services/gpt";
import { selectorQuery, TextBoxKeysQuery } from "../services/queries";
import dirTextCreator from "./dirTextCreator";
import generateSlugs from "./generateSlugs";

const DIR_TIMEOUT_MS = 30000; // 30 seconds timeout per directory

async function handleDir(
  dir: string,
  slug: string,
  textBoxes: { key: string; subtitle: string }[]
) {
  if (textBoxes.find((tb) => tb.key === dir || tb.subtitle === slug)) {
    mylog(`Skipped ${dir}`, "warning");
    return;
  }

  mylog(dir, "hidden");

  const promptEnd = await findPrompt(
    `dir_${Math.floor(Math.random() * 5) + 1}`
  );
  await delay(1000);
  const res = (await callGPT(`${slug} ${promptEnd}`, dir)) as any;

  if (!res) {
    mylog(`No response for ${dir}`, "error");
    return;
  }

  const locales = ["en", "ru"] as const;
  await Promise.all(
    locales.map(async (locale) => {
      if (res[`${locale}_description`]) {
        const textBoxCreatedID = await dirTextCreator(
          res[`${locale}_description`],
          dir,
          locale,
          slug
        );
        mylog(`Text box created with ID: ${textBoxCreatedID}`, "success");
      }
    })
  );

  await delay(12000);
}

export async function fillDirs() {
  while (true) {
    try {
      const slugs = await generateSlugs();

      const { textBoxes } = (await callStrapi(TextBoxKeysQuery)) as {
        textBoxes: { key: string; subtitle: string }[];
      };

      for (const [dir, slug] of Object.entries(slugs)) {
        try {
          await Promise.race([
            handleDir(dir, slug, textBoxes),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error(`Timeout for ${dir}`)),
                DIR_TIMEOUT_MS
              )
            ),
          ]);
        } catch (e) {
          mylog(
            `Skipped ${dir} due to timeout or error: ${(e as Error).message}`,
            "error"
          );
        }
      }

      break; // All done
    } catch (err) {
      mylog("fillDirs failed. Restarting in 5 seconds...", "error");
      await delay(5000);
    }
  }
}
