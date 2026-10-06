import apiClient from "./apiClient";

/**
 * Send a chat message to the CurrEx Assistant backend.
 *
 * @param {string} message - Current prompt from the user.
 * @param {Array} history - Previous conversation history [{ role: 'user' | 'model', parts: [{ text: string }] }].
 * @returns {Promise<{ success: boolean, reply: string }>}
 */
export async function sendChatMessage(message, history = []) {
  const response = await apiClient.post("/chat", {
    message,
    history,
  });
  return response.data;
}

export default {
  sendChatMessage,
};

