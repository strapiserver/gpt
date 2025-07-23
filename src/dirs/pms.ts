import { IPossiblePmPair } from "../types/exchange";
import {
  IOption,
  IPm,
  IPmGroup,
  IPmPointer,
  IPopularAs,
  ISection,
  ISelector,
} from "../types/selector";

const getOptionCode = (option: IOption, prefix?: string): string => {
  return (
    (option?.code && option?.code.toUpperCase()) || // USDTERC
    (prefix &&
      prefix.toUpperCase() !== option?.currency?.code.toUpperCase() &&
      prefix.toUpperCase() + option?.currency?.code.toUpperCase()) || // SBERRUB
    option?.currency?.code.toUpperCase()
  ); // BTC
};

export const singlePmHasUnmetPairs = (pm: IPm, possiblePairs?: string[]) => {
  if (possiblePairs?.find((pair) => pm.code === pair)) return false;
  return true;
};

export const extractPmsFromPmGroup = (
  pm_group: IPmGroup,
  popular_as?: IPopularAs
): IPm[] | undefined => {
  if (!pm_group) return;
  return pm_group.options.map((option) => {
    const code = getOptionCode(option, pm_group?.prefix);
    const subgroup_name = (option.name && option.name.toUpperCase()) || null;

    const { id, en_name, ru_name, section, icon, color } = pm_group;

    return {
      pm_group_id: id,
      code, // USDTERC20
      en_name, // Tether
      ru_name,
      subgroup_name, // ERC-20
      currency: option?.currency, // USDT
      icon,
      color,
      popular_as: popular_as || null,
      section,
    };
  });
};

export const pmsToSlug = ({
  givePm,
  getPm,
}: {
  givePm?: IPm;
  getPm?: IPm;
}): string => {
  if (!givePm || !getPm) return "";
  const slug = `${givePm.en_name}-${givePm.currency.code}${
    givePm.subgroup_name ? "-" + givePm.subgroup_name : ""
  }-to-${getPm.en_name}-${getPm.currency.code}${
    getPm.subgroup_name ? "-" + getPm.subgroup_name : ""
  }`;
  return slug.toLowerCase().replaceAll(" ", "").replaceAll("/", "");
};

export const pmFromPmGroups = (
  name: string,
  curCode: string,
  subgroupName: string,
  pmGroups: IPmGroup[]
): IPm | undefined => {
  const pmGroup = pmGroups.filter((pmg) => {
    return (
      pmg.en_name === name &&
      pmg.options.find(
        (op) =>
          (op.name && op.name.replaceAll(" ", "") === subgroupName) ||
          op.currency.code === curCode
      )
    );
  });

  if (!pmGroup) return;
  const pms = extractPmsFromPmGroup(pmGroup[0]);
  return (
    pms &&
    pms.find(
      (pm) =>
        pm.subgroup_name?.toLowerCase() === subgroupName ||
        pm.currency.code === curCode
    )
  );
};

export const getPms = (selector: ISelector) => {
  const pmGroups: IPmGroup[] = selector.sections.flatMap((section: ISection) =>
    section.pm_groups.map((pmg) => ({
      ...pmg,
      section: section.en_title.toLowerCase(),
    }))
  );

  // Extract PMs
  const pms: IPm[] = pmGroups.flatMap((pmGroup) => {
    const extracted = extractPmsFromPmGroup(pmGroup);
    if (!extracted?.length) console.log("Missing PMs in group:", pmGroup);
    return extracted || [];
  });

  return pms;
};

export const getSlugs = (dirs: string[], pms: IPm[]) => {
  // Map slugs to pair codes
  const slugToCodes: Record<string, string> = dirs.reduce((acc, dir) => {
    const [give, get] = dir.split("_");
    const pair: IPossiblePmPair = {
      givePm: pms.find((pm) => pm.code.toUpperCase() === give),
      getPm: pms.find((pm) => pm.code.toUpperCase() === get),
    };
    const slug = pmsToSlug(pair);
    return slug ? { ...acc, [slug]: dir } : acc;
  }, {});
  const inversed = Object.fromEntries(
    Object.entries(slugToCodes).map(([slug, dir]) => [dir, slug])
  );
  return inversed;
};

export const destructureDirSlug = (slug: string) => {
  const [giveNameCurCode, getNameCurCode] = slug.split("-to-");
  const [giveName, giveCurCode, giveSubgroupName] = giveNameCurCode.split("-");
  const [getName, getCurCode, getSubgroupName] = getNameCurCode.split("-");
  return {
    giveName,
    giveCurCode,
    giveSubgroupName,
    getName,
    getCurCode,
    getSubgroupName,
  };
};
