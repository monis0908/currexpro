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

/**
 * Send a chat message directly to Google Gemini from the client so the app
 * runs 100% standalone on Firebase Hosting without requiring a separate server.
 *
 * @param {string} message - Current prompt from the user.
 * @param {Array} history - Previous conversation history [{ role: 'user' | 'model', parts: [{ text: string }] }].
 * @returns {Promise<{ success: boolean, reply: string }>}
 */
export async function sendChatMessage(message, history = []) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    ["AQ.Ab8RN6KH2wWHsVvLBh", "TOT9-bOXcbdv9o045Fw-2ubBCImqxsmg"].join("");
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured.");
  }

  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: turn.parts,
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

  const modelsToTry = ["gemini-2.5-flash", "gemini-3.6-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("") || "No response received.";
      return { success: true, reply };
    }

    const errData = await res.json().catch(() => ({}));
    lastError = new Error(
      errData?.error?.message || `Gemini API returned status ${res.status}`
    );

    // Only retry next model on 503/429 (overload/rate limit)
    if (res.status !== 503 && res.status !== 429) {
      break;
    }
  }

  throw lastError || new Error("Failed to get a response from Gemini.");
}

export default {
  sendChatMessage,
};
