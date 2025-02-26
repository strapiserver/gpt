import { GraphQLClient } from "graphql-request";
import db from "../db";
import normalizer from "./normalizer";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
const strapiLink =
  env === "production" ? process.env.STRAPI! : process.env.DEV_STRAPI!;

const callStrapi = async (query: any, variables?: any) => {
  const jwt = db.getData(".jwt");
  const headers = jwt
    ? {
        authorization: `Bearer ${jwt}`,
      }
    : ({} as {});

  const graphQLClient = new GraphQLClient(strapiLink || "", {
    headers,
  });
  try {
    const data = await graphQLClient.request(query, variables);
    const res = normalizer(data);
    return res;
  } catch (err) {
    console.error("📙 \u001b[1;33m -- GQL ERROR -- ");
    console.error("📙 \u001b[1;33m JWT exists:", jwt && jwt.length > 5);
    console.error(err);
  }
};

export default callStrapi;
