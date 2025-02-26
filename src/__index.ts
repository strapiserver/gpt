import Fastify from "fastify";
import dotenv from "dotenv";
import axios from "axios";
import auth from "./services/auth";
import callStrapi from "./services/callStrapi";
import { PromptsQuery } from "./services/queries";
import { IPrompt } from "./types";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY as string;
const COHERE_API_URL = "https://api.cohere.ai/generate";

if (!COHERE_API_KEY) {
  throw new Error(
    "Cohere API key is missing. Please set COHERE_API_KEY in .env."
  );
}

// Define types for request and response

interface CohereResponse {
  text: string;
}

const server = Fastify({
  logger: true,
});

server.get("/", async (req: any, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.send("working...");
});

server.get("/code=:code/:pm_name?", async function (request, reply) {
  reply.header("Access-Control-Allow-Origin", "*");

  const data = (await callStrapi(PromptsQuery)) as { prompts: IPrompt[] };

  const { code, pm_name } = request.params as { pm_name: string; code: string };
  console.log("code: ", code);

  const promptDescription =
    code &&
    data?.prompts?.find((p) => p.code.toLowerCase() == code.toLowerCase())
      ?.description;

  if (!code || !promptDescription) {
    return reply.send({
      error: "Invalid or missing code",
      code,
      promptDescription,
    });
  }
  const prompt = `${pm_name}: ${promptDescription}`;
  console.log("prompt: ", prompt);

  try {
    // Prepare payload for Cohere API
    const data = {
      model: "command-xlarge-nightly", // Or another model as needed
      prompt,
      max_tokens: 2000, // Adjust max tokens as per requirements
      temperature: 0.9, // Adjust creativity level
    };

    // Call Cohere API
    const response = await axios.post<CohereResponse>(COHERE_API_URL, data, {
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Ensure the response has the expected structure
    const generatedText = response?.data?.text || "No text generated";

    return reply.send({ generatedText });
  } catch (error) {
    console.error("Error calling Cohere API:", error);

    // Ensure only one reply is sent
    return reply.status(500).send({ error: "Failed to generate text" });
  }
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
