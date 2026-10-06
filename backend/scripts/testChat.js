import "../env.js";
import { chat } from "../services/aiService.js";
import readline from "readline";

const argMessage = process.argv.slice(2).join(" ").trim();

if (argMessage) {
  // One-off question from command line arguments
  console.log(`\n\x1b[36m[You]:\x1b[0m ${argMessage}\n`);
  console.log("\x1b[33mCurrEx Assistant is thinking...\x1b[0m\n");
  try {
    const reply = await chat(argMessage);
    console.log(`\x1b[32m[CurrEx Assistant]:\x1b[0m\n${reply}\n`);
  } catch (err) {
    console.error("\x1b[31mError:\x1b[0m", err.message);
  }
} else {
  // Interactive chat mode
  console.log("\x1b[32m=== CurrEx Assistant Interactive Chat ===\x1b[0m");
  console.log("Type your message and press Enter. Type 'exit' or press Ctrl+C to quit.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const history = [];

  const promptUser = () => {
    rl.question("\x1b[36mYou:\x1b[0m ", async (input) => {
      const trimmed = input.trim();
      if (!trimmed) {
        promptUser();
        return;
      }
      if (trimmed.toLowerCase() === "exit") {
        console.log("Exiting chat. Bye!");
        rl.close();
        return;
      }

      console.log("\x1b[33mAssistant is typing...\x1b[0m");
      try {
        const reply = await chat(trimmed, history);
        console.log(`\n\x1b[32mAssistant:\x1b[0m\n${reply}\n`);
        history.push({ role: "user", parts: [{ text: trimmed }] });
        history.push({ role: "model", parts: [{ text: reply }] });
      } catch (err) {
        console.error("\x1b[31mError:\x1b[0m", err.message);
      }
      promptUser();
    });
  };

  promptUser();
}

