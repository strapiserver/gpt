import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "fs";
import { delay, makeRefLink, mylog, saveProgress } from "../helper";

import { IScrapedBC } from "../types";

// эта штука превращает "bestchange.com/click.php?id=1289" в это  "geekchange.com"

export async function fillRealLinks() {
  // with retry
  while (true) {
    try {
      await fillReal();
      break; // exit loop if it completes successfully
    } catch (err) {
      mylog("fillRealLinks failed. Restarting in 5 seconds...", "error");
      await delay(5000);
    }
  }
}

export async function fillReal() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const context = await browser.createBrowserContext();

  const initial = JSON.parse(
    readFileSync("bc-scraped.json", "utf-8")
  ) as IScrapedBC[];

  const saved = JSON.parse(
    readFileSync("bc-real-links.json", "utf-8") || "[]"
  ) as IScrapedBC[];

  const bc = saved.length ? saved : initial;

  for (const [index, exchanger] of bc.entries()) {
    if (exchanger.real_link) continue;
    const newExchanger = exchanger;
    const fullUrl = `https://bestchange.com${exchanger.link}`;
    mylog(`🔗 Opening ${fullUrl}`);
    const page = await context.newPage();

    try {
      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 90_000, // 90 seconds
      });

      mylog("⏳ Waiting 17 seconds for CAPTCHA...");
      await delay(17_000);

      const realLink = makeRefLink(page.url());
      newExchanger.real_link = realLink;
      bc[index] = newExchanger;
      mylog(`✅ ${index} of ${bc.length}: ${realLink}`, "success");

      // 🔐 Save after successful load
      saveProgress(bc, "bc-real-links.json");
    } catch (err: any) {
      mylog(`❌ Failed to load: ${fullUrl}`, "error");
      // 💾 Save even on failure
      saveProgress(bc, "bc-real-links.json");
      continue;
    } finally {
      await page.close();
      await delay(2000);
    }
  }

  await browser.close();

  console.log("\n🟢 Filled: " + bc.filter((e) => e.real_link).length);
  console.log(
    JSON.stringify(
      bc.filter((e) => !e.real_link),
      null,
      2
    )
  );
}
