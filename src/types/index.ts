export interface IPrompt {
  code: string;
  description: string;
}

export interface IDB {
  jwt: string;
  prompts: string[];
}

export interface IArticleData {
  header: string;
  subheader: string;
  stats: { [key: string]: string };
  chapters: {
    title: string;
    text: string;
  }[];
}

export interface IExchangerData {
  en_description?: string;
  ru_description?: string;
  email?: string;
  telegram?: string;
  working_time?: string;
  partners?: string[];
}
