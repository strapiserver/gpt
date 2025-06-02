import { IPm, ISelector } from "./selector";

export type ISectionName = "crypto" | "bank" | "cash" | "digital" | "transfer";

export type IDonors = { [key: string]: { [key: string]: string } };
// {BTC_CASHRUB: {samara: "moscow"}}

export interface IPmLayout {
  id: string;
  section: ISectionName;
  description: string;
}

export interface IPmLayoutsData {
  givePmLayout: IPmLayout;
  getPmLayout: IPmLayout;
  giveArticleExists: boolean;
  getArticleExists: boolean;
}

export interface IDirText {
  id: string;
  section_give: ISectionName;
  section_get: ISectionName;
  text: string;
  title: string;
  updatedAt: string;
}

export interface IPath {
  params: {
    exchange: string;
  };
  locale: string;
}

export type IPmData = {
  pm: IPm;
  pmLayout?: IPmLayout;
  articleExists: boolean;
};

export interface IParserSetting {
  cities: ICity[];
}

export interface IPossiblePmPair {
  givePm?: IPm;
  getPm?: IPm;
}

// export interface ICities {
//   [key: string]: [string, string];
// }
export interface ICity {
  codes: string[];
  en_name: string;
  ru_name: string;
  population: number;
  coordinates: number[];
  preposition: string;
  closest_cities: { en_name: string; ru_name: string }[];
  en_country_name: string;
  ru_country_name: string;
}

export interface IPmPairs {
  slug: string;
  givePm?: IPm;
  getPm?: IPm;
}
