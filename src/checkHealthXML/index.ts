import callStrapi from "../services/callStrapi";
import { LinksQuery } from "../services/queries";
import { IExchangerData, IScrapedBC } from "../types";

import { mylog } from "../helper";

export const checkHealthXML = async () => {
  const data = await callStrapi(LinksQuery);
  const exData = data.exchangers as IExchangerData[];
  let healthyLink = [] as string[];
  let unhealthyLink = [] as string[];
  let healthyXML = [] as string[];
  let accessibleXML = [] as string[];
  let unhealthyXML = [] as string[];
  let errors = [] as string[];

  for (const [index, exchanger] of exData.entries()) {
    // mylog(`Checking ${index} out of ${exchangerLinks.length} ...`, "info");
    const xml = exchanger?.rates_link;
    const link = exchanger?.ref_link;
    if (!xml) continue;
    if (!link) continue;

    if (!(index % 12)) {
      mylog(`____ ____ ____ ____`, "hidden");
      mylog(`XML ${unhealthyXML.length}`, "error");
      mylog(`XML ${accessibleXML.length}`, "warning");
      mylog(`XML ${healthyXML.length}`, "success");
      mylog(`____ ____ ____ ____`, "hidden");
      mylog(`Link ${unhealthyLink.length}`, "error");
      mylog(`Link ${healthyLink.length}`, "success");
      mylog(`____ ____ ____ ____`, "hidden");
      mylog(`total checked ${index}`);
      mylog(`total links ${exData.length}`);
      mylog(`errors ${errors.length}`, "error");
      mylog(`____ ____ ____ ____`, "hidden");
    }

    try {
      let responseXML = await fetch(xml, { method: "HEAD" });
      let responseLink = await fetch(link, { method: "HEAD" });
      if (responseLink.ok) {
        healthyLink = [...healthyLink, link];
      } else {
        unhealthyLink = [...unhealthyLink, link];
      }
      if (responseXML.ok) {
        const contentType = responseXML.headers.get("content-type") || "";

        if (/xml/.test(contentType)) {
          healthyXML = [...healthyXML, xml];
          mylog(xml, "success");
          continue;
        }
        accessibleXML = [...accessibleXML, xml];
        mylog(xml, "warning");
        continue;
      }

      unhealthyXML = [...unhealthyXML, xml];
      mylog(xml, "error");
    } catch (error) {
      errors = [...errors, xml || link];
      mylog(xml || link, "error");
      continue;
    }
  }
  mylog("-- FINISHED --", "important");
  mylog(`____ ____ ____ ____`, "hidden");
  mylog(`XML ${unhealthyXML.length}`, "error");
  mylog(`XML ${accessibleXML.length}`, "warning");
  mylog(`XML ${healthyXML.length}`, "success");
  mylog(`____ ____ ____ ____`, "hidden");
  mylog(`Link ${unhealthyLink.length}`, "error");
  mylog(`Link ${healthyLink.length}`, "success");
  mylog(`____ ____ ____ ____`, "hidden");
  mylog(`total links ${exData.length}`);
  mylog(`____ ____ ____ ____`, "hidden");
  unhealthyXML.map((l) => mylog(l, "hidden"));
  accessibleXML.map((l) => mylog(l, "info"));
};
