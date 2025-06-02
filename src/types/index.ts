export interface IPrompt {
  code: string;
  description: string;
}

export interface IDB {
  jwt: string;
  prompts: string[];
}

export interface IArticleGPT {
  ru: IArticleData;
  en: IArticleData;
}

export interface IArticleData {
  header: string;
  subheader: string;
  stats: { [key: string]: number };
  chapters: {
    title: string;
    text: string;
  }[];
}

export interface IDescriptionData {
  en_description?: string;
  ru_description?: string;
  email?: string;
  telegram?: string;
  working_time?: string;
  partners?: string[];
}

export interface IExchangerData {
  id: string;
  name: string;
  rates_link: string;
  ref_link: string;
}

export interface IScrapedBC {
  name: string;
  link: string;
  card: string;
  real_link?: string;
  xml?: string;
}
