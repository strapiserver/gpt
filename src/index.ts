import Fastify from "fastify";

import auth from "./services/auth";

import db from "./db";
import { findxml } from "./xml";
import { fillRealLinks } from "./fillReal";
import { parseBest } from "./parsebest";
import { makeRefLink, getPmNames, sleep, createArticle } from "./helper";
import { filldescriptions } from "./descriptions";
import { fillArticles } from "./articles";
import { createExchangers } from "./createExchangers";

const server = Fastify({
  logger: true,
});

server.get("/", async (req: any, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  const data = db.getData(".");
  const { jwt, ...rest } = data;
  reply.send(JSON.stringify(rest));
});
server.get("/parsebest", async (req: any, reply) => {
  //step 1
  reply.header("Access-Control-Allow-Origin", "*");
  parseBest();
  reply.send("parsebest");
});

server.get("/fillreal", async (req: any, reply) => {
  //step 2
  reply.header("Access-Control-Allow-Origin", "*");
  // сперва берем все ссылки беста и конвертируем  "bestchange.com/click.php?id=1289" в это  "geekchange.com"
  fillRealLinks();
  reply.send("fillreal");
});

server.get("/findxml", async (req: any, reply) => {
  //step 3
  reply.header("Access-Control-Allow-Origin", "*");
  //берем все xml моих обменников и находим дублирующиеся окончания ссылок
  // добавляем эти окончания в ссылку от беста и ищем xml
  //
  findxml();
  reply.send("findxml");
});

server.get("/create", async (req: any, reply) => {
  //step 4
  reply.header("Access-Control-Allow-Origin", "*");
  createExchangers();
  reply.send("create");
});

server.get("/filldescriptions", async (req: any, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.send("filldescriptions");
  filldescriptions();
});

server.get("/section=:sectionName", async function (request, reply) {
  // создает артиклы к пм
  reply.header("Access-Control-Allow-Origin", "*");
  const { sectionName } = request.params as { sectionName: string };
  fillArticles(sectionName);
});
const port = +process.env.PORT!;
console.log("port is: ", port);

// Run the server!
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
    await auth();
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};
start();
