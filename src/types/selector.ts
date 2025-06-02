interface ISelector {
  id: string;
  en_give_header: string;
  ru_give_header: string;
  en_get_header: string;
  ru_get_header: string;
  search_bar: ISearchBar;
  sections: ISection[];
}

interface ISearchBar {
  en_placeholder: string;
  ru_placeholder: string;
  en_give_adornment: string;
  ru_give_adornment: string;
  en_get_adornment: string;
  ru_get_adornment: string;
}

interface ISection {
  id: string;
  rows: number;
  columns: number;
  en_title: string;
  ru_title: string;
  pm_groups: IPmGroup[];
}

interface IPmGroup {
  id: string;
  countries: string[];
  en_name: string;
  ru_name?: string;
  prefix?: string;
  icon?: IImage;
  color: string;
  options: IOption[];
  section?: string;
}

interface IImage {
  id: string;
  url: string;
  alternativeText: string;
}

interface IOption {
  name?: string;
  code?: string;
  currency: ICurrency;
}

interface ICurrency {
  id: string;
  code: string;
  accuracy: string;
}

/// дополнительный тип
export type IPopularAs = "crypto" | "fiat" | "none";
export interface IPmPointer {
  id: string;
  code: string;
  popular_as?: IPopularAs;
  pm_group: IPmGroup;
}

interface IPm {
  pm_group_id: string;
  code: string; // USDTERC20
  currency: ICurrency; // USDT
  en_name: string; // Tether ERC-20
  ru_name?: string;
  subgroup_name?: string | null; // ERC-20 отобразить в подгруппе
  icon?: IImage;
  toUsd?: number;
  possible_pairs?: string[];
  color: string;
  popular_as?: IPopularAs | null;
  section?: string;
}

type ISide = "give" | "get";

export type {
  ISelector,
  ISearchBar,
  ISection,
  IPmGroup,
  ICurrency,
  IOption,
  IPm,
  IImage,
  ISide,
};
