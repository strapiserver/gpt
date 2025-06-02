import Fastify from "fastify";
import auth from "./services/auth";
import db from "./db";
import { findxml } from "./xml";
import { fillRealLinks } from "./fillReal";
import { parseBest } from "./parsebest";
import { loadExchangersHTML } from "./descriptions/loadExchangersHTML";
import { fillArticles } from "./articles";
import { createExchangers } from "./createExchangers";
import { checkHealthXML } from "./checkHealthXML";
import { HTML } from "./HTML";
import { fillDescriptionsAuto } from "./descriptions/fillDescriptionsAuto";
import fillDescriptionsFromFile from "./descriptions/fillDescriptionsFromFile";
import { gql } from "graphql-request";
import callStrapi from "./services/callStrapi";
import { fillDirs } from "./dirs";

const server = Fastify({ logger: true });

// Serve interactive HTML with buttons
server.get("/", async (req, reply) => {
  reply.type("text/html").send(HTML);
});

// Script endpoints
server.get("/parsebest", async (req, reply) => {
  parseBest();
  reply.send("parsebest done");
});

server.get("/fillreal", async (req, reply) => {
  fillRealLinks();
  reply.send("fillreal done");
});

server.get("/findxml", async (req, reply) => {
  findxml();
});

server.get("/create", async (req, reply) => {
  createExchangers();
});

server.get("/filldirs", async (req, reply) => {
  fillDirs();
});

server.get("/loadExchangersHTML", async (req, reply) => {
  loadExchangersHTML();
});

server.get("/fillDescriptionAuto", async (req, reply) => {
  fillDescriptionsAuto();
});

server.get("/fillDescriptionsFromFile", async (req, reply) => {
  fillDescriptionsFromFile();
});

server.get("/checkhealthy", async (req, reply) => {
  //checkHealthXML();
  const RootTextQuery = gql`
    query TextBox($locale: I18NLocaleCode, $key: String) {
      textBoxes(locale: $locale, filters: { key: { eqi: $key } }) {
        data {
          id
          attributes {
            title
            subtitle
            text
          }
        }
      }
    }
  `;
  const res = await callStrapi(RootTextQuery, { locale: "ru", key: "root" });

  console.log("textBoxes", res);
});

server.get("/section=:sectionName", async (request, reply) => {
  const { sectionName } = request.params as { sectionName: string };
  fillArticles(sectionName);
});

// Start the server
const port = +process.env.PORT!;
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
    await auth();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
