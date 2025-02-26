import callStrapi from "./services/callStrapi";
import { CreateArticle } from "./services/queries";
import { IArticleData } from "./types";
import { IPmGroup, ISection } from "./types/selector";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createArticle = async (
  code: string,
  locale: string,
  articleData?: IArticleData
) => {
  if (!articleData) {
    console.log(`📕 \u001b[1;31m articleData ${articleData} failed!`);
    return;
  }
  try {
    const { chapters, header, stats, subheader } = articleData;
    const acticleCreated = (await callStrapi(CreateArticle, {
      chapters,
      header,
      stats,
      subheader,
      code,
      locale,
    })) as {
      id: string;
    };
    console.log("acticle created:", acticleCreated);
  } catch (e) {
    console.log(`📕 \u001b[1;31m Saving article failed!`);
    console.log(e);
  }
};

export const getPmNames = (sections: ISection[]): string[] => {
  const pmGroups = sections.reduce(
    (res: IPmGroup[], section) => [...res, ...section.pm_groups],
    []
  );
  return pmGroups.reduce(
    (allNames: string[], pmGroup) => [...allNames, capitalize(pmGroup.en_name)],
    []
  );
};

export const capitalize = (s: string | undefined) => {
  if (typeof s !== "string") return "";
  const words = s.split(" ");
  const res = words
    .map((w, index) =>
      index > 0 && w.length < 4
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
  return res;
};

export const makeRefLink = (link: string) => {
  return link
    .replace(/https?:\/\/(www\.)?/i, "___")
    .split("/")[0]
    .replace("api.", "")
    .replace("___", "https://");
};
