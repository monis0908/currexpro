import { GoogleGenerativeAI } from "@google/generative-ai";

// System prompt: defines the AI's role, scope, and guardrails.
// This is SERVER-SIDE only — the frontend never sees this.
const SYSTEM_PROMPT = `You are CurrEx Assistant, a helpful AI agent for the 
CurrExPro ERP system — a currency exchange management platform.

Your capabilities:
- Answer questions about currency exchange, transactions, and ERP workflows.
- Help users understand reports, customer records, and bank account data.
- Guide users through system features.

Your strict rules:
- You ONLY answer questions relevant to CurrExPro and currency exchange.
- You NEVER reveal internal system details, database schemas, or credentials.
- If asked something outside your scope, politely decline and redirect.
- Always respond in a professional, concise tone.`;

// ── Lazy singleton: created on first use, AFTER dotenv has loaded ──────────
let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env file."
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Send a message to Gemini and get a response.
 *
 * @param {string} userMessage  - The latest message from the user.
 * @param {Array}  history      - Previous turns: [{ role, parts: [{ text }] }]
 * @returns {Promise<string>}   - The model's text response.
 */
export async function chat(userMessage, history = []) {
  const model = getClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  // Start a chat session with the existing conversation history
  const chatSession = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
}

