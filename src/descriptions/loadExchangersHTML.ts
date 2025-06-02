import { spawn } from "child_process";
import fetch from "node-fetch"; // use axios if you prefer
import CDP from "chrome-remote-interface";

import * as fs from "fs/promises";
import { mylog } from "../helper";
import callStrapi from "../services/callStrapi";
import { findPrompt } from "../services/gpt";
import { DescriptionQuery } from "../services/queries";
import { IExchangerData } from "../types";
import { getDomain } from "../xml/helper";
import { scrape } from "../services/cheerio";

//
const range = [0, 100];
// фигачим [0 100] [100 200] [200 300] итд
//

const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const USER_DATA_DIR = "/tmp/chrome-automation"; // or "./chrome-profile"
const DEBUGGING_URL = "http://localhost:9222/json/version";
async function launchRealChrome() {
  mylog("Launching real Chrome...");

  spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=9222`,
      `--user-data-dir=${USER_DATA_DIR}`,
      `--no-first-run`,
      `--no-default-browser-check`,
    ],
    {
      detached: true,
      stdio: "ignore",
    }
  ).unref();

  await waitForChromeToBeInteractive();
}

async function openTabs(urls: string[]) {
  const client = await CDP(); // No target specified here!

  const { Target } = client;

  for (const url of urls) {
    await Target.createTarget({ url });
    mylog(`Opened tab: ${url}`, "hidden");
  }

  await client.close();
}

async function waitForChromeToBeInteractive() {
  while (true) {
    try {
      const version = await fetch(DEBUGGING_URL).then((res) => res.json());
      const targetList = await fetch("http://localhost:9222/json/list").then(
        (res) => res.json()
      );

      const hasRealPage = targetList.some(
        (t: any) => t.type === "page" && t.url !== "about:blank"
      );

      if (hasRealPage) {
        mylog("Chrome has an active tab!", "important");
        break;
      } else {
        mylog("Waiting for Chrome tab...", "hidden");
      }
    } catch (err) {
      mylog("Waiting for Chrome to start...", "hidden");
    }

    await new Promise((res) => setTimeout(res, 1000));
  }
}

async function saveAllTabs() {
  const versionInfo = await fetch(DEBUGGING_URL).then((r) => r.json());
  const { webSocketDebuggerUrl } = versionInfo;

  const client = await CDP({ target: webSocketDebuggerUrl });
  const { Target } = client;

  const targets = await Target.getTargets();

  for (const target of targets.targetInfos) {
    if (target.type === "page" && target.url.startsWith("http")) {
      const pageClient = await CDP({ target: target.targetId });

      const { Page, Runtime } = pageClient;

      await Page.enable();

      const { result } = await Runtime.evaluate({
        expression: "document.documentElement.outerHTML",
        returnByValue: true,
      });
      if (!result.value) {
        mylog("Error: " + target.url, "error");
        return;
      }
      const content = (await scrape(
        "",
        true,
        undefined,
        result.value
      )) as string;

      const filenameSafeUrl = getDomain(target.url);

      const filename = `${filenameSafeUrl}.html`;

      await fs.writeFile(`./saved/${filename}`, content);

      mylog(`Saved: ${filename}`, "success");

      await pageClient.close();
    }
  }

  await client.close();
}

export async function loadExchangersHTML() {
  await launchRealChrome();
  const data = await callStrapi(DescriptionQuery);

  const exchangers = data.exchangers.filter(
    (e: any) => e.ref_link
  ) as IExchangerData[];
  mylog(`Exchangers without description found: ${exchangers.length}`);
  const urls = exchangers.map((e) => e.ref_link).slice(range[0], range[1]);

  await openTabs(urls);

  mylog("Please solve captchas and press ENTER to continue...");
  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => resolve());
  });

  await saveAllTabs();

  mylog("Done!", "success");
}
