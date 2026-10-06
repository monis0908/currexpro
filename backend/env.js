// This module must be the FIRST import in server.js.
// In ES Modules, all imports are hoisted and executed before any code runs,
// so dotenv must be configured in its own module imported before everything else.
import dotenv from "dotenv";
dotenv.config();

