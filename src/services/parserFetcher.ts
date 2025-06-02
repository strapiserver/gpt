import axios from "axios";

export const initParserFetcher = () => {
  const url = process.env.PARSER_URL;

  if (!url) {
    throw new Error("PARSER_URL is not defined in the environment variables.");
  }
  return async (slug: string) => {
    try {
      const { data } = await axios.get(url + "/" + slug);
      return data;
    } catch (e) {
      console.error("PARSER FETCHER ERROR ", e);
      return null;
    }
  };
};
