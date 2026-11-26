import OpenAI from "openai";

// POST /api/brain { text } -> { template, values: [{ key, value }] }
// Asks OpenAI which parts of a piece of text vary between uses, and rewrites
// them as {{key}} placeholders.

const SYSTEM = `You turn a piece of text into a reusable template for a string-replacement tool.

Find the parts of the text that are specific values likely to change each time the text is reused (names, dates, times, numbers, amounts, places, IDs, URLs, emails, product names and the like) and replace each one with a {{key}} placeholder.

Rules:
- Keys are English and identifier-like: letters, digits, _ and $, never starting with a digit. Use short descriptive snake_case names, e.g. {{customer_name}}, {{order_id}}.
- The same value appearing more than once gets the same key.
- Keep every other character exactly as it is: wording, punctuation, whitespace and line breaks.
- Placeholders already in the text ({{key}}, spaces inside allowed) stay as they are; normalize them to {{key}} without spaces.
- Single braces are plain text (JSON is fine). A literal "{{" that is not a placeholder must be written as "\\{{".
- If nothing in the text should vary, return it unchanged with no values.

Also return, for each key, the original value it replaced, so that filling the template with these values reproduces the original text. Placeholders that were already in the text get an empty value.`;

const SCHEMA = {
  type: "object",
  properties: {
    template: { type: "string" },
    values: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
        },
        required: ["key", "value"],
        additionalProperties: false,
      },
    },
  },
  required: ["template", "values"],
  additionalProperties: false,
};

async function convert(client, model, text) {
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_schema", json_schema: { name: "template", strict: true, schema: SCHEMA } },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: text },
    ],
  });

  const choice = completion.choices[0];
  const message = choice?.message;
  if (message?.refusal) throw new Error("The model declined this text.");
  if (choice?.finish_reason === "length") throw new Error("The text is too long to convert.");
  if (!message?.content) throw new Error("Empty response from the model.");
  return JSON.parse(message.content);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function errorMessage(error) {
  if (error instanceof OpenAI.AuthenticationError) return "AI is not configured (check OPENAI_API_KEY).";
  if (error instanceof OpenAI.RateLimitError) return "AI is busy, try again in a moment.";
  if (error instanceof OpenAI.APIError && error.status) return `AI error ${error.status}`;
  return error.message || "AI request failed.";
}

// Connect-style middleware: answers POST /api/brain, passes everything else to next()
export function createBrainHandler(env) {
  let client;

  return async function handler(req, res, next) {
    if (req.url !== "/api/brain") return next();
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

    try {
      const { text } = JSON.parse((await readBody(req)) || "{}");
      if (typeof text !== "string" || !text.trim()) {
        return send(res, 400, { error: "Template is empty." });
      }
      if (!env.OPENAI_API_KEY) {
        return send(res, 500, { error: "AI is not configured (set OPENAI_API_KEY in .env)." });
      }
      client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });
      send(res, 200, await convert(client, env.OPENAI_MODEL || "gpt-4o-mini", text));
    } catch (error) {
      console.error("[brain]", error);
      send(res, 500, { error: errorMessage(error) });
    }
  };
}

// Serves /api/brain from `vite` (dev) and `vite preview` (production, under pm2)
export function brainPlugin(env) {
  const handler = createBrainHandler(env);
  return {
    name: "tgen-brain",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
