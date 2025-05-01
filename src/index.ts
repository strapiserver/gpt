import Fastify from "fastify";
import auth from "./services/auth";
import db from "./db";
import { findxml } from "./xml";
import { fillRealLinks } from "./fillReal";
import { parseBest } from "./parsebest";
import { fillDescriptionsManual } from "./descriptions/fillDescriptionsManual";
import { fillArticles } from "./articles";
import { createExchangers } from "./createExchangers";
import { checkHealthXML } from "./checkHealthXML";

const server = Fastify({ logger: true });

// Serve interactive HTML with buttons
server.get("/", async (req, reply) => {
  reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Script Runner</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          button, input {
            font-size: 16px;
            margin: 5px 0;
            padding: 8px 16px;
          }
        </style>
      </head>
      <body>
        <h2>Run Scripts</h2>
        <button onclick="run('parsebest')">Parse Best</button>
        <button onclick="run('fillreal')">Fill Real Links</button>
        <button onclick="run('findxml')">Find XML</button>
        <button onclick="run('create')">Create Exchangers</button>
        <button onclick="run('filldescriptions')">Fill Descriptions</button>
        <button onclick="run('checkhealthy')">Check Health XML</button>

        <div style="margin-top: 10px;">
          <input id="sectionInput" placeholder="Enter section name" />
          <button onclick="runSection()">Fill Articles (section)</button>
        </div>

        <script>
          const base = "";

          function run(route) {
            fetch(\`\${base}/\${route}\`)
              .then(res => res.text())
              .then(res => alert("Success: " + res))
              .catch(err => alert("Error: " + err));
          }

          function runSection() {
            const val = document.getElementById("sectionInput").value;
            if (!val) return alert("Enter section name");
            fetch(\`/section=\${encodeURIComponent(val)}\`)
              .then(res => res.text())
              .then(res => alert("Success: " + res))
              .catch(err => alert("Error: " + err));
          }
        </script>
      </body>
    </html>
  `);
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
  reply.send("findxml done");
});

server.get("/create", async (req, reply) => {
  createExchangers();
  reply.send("create done");
});

server.get("/filldescriptions", async (req, reply) => {
  fillDescriptionsManual();
  reply.send("filldescriptions done");
});

server.get("/checkhealthy", async (req, reply) => {
  checkHealthXML();
  reply.send("checkhealthy done");
});

server.get("/section=:sectionName", async (request, reply) => {
  const { sectionName } = request.params as { sectionName: string };
  fillArticles(sectionName);
  reply.send("section fill done");
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
