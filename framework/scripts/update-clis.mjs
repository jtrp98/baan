// Command script to check and auto-update the 3 AI CLIs (agy, claude, codex)
import { updateClis } from "../src/update-clis.mjs";

const result = await updateClis();
process.exit(result.ok ? 0 : 1);
