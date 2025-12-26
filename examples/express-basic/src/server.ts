import express from "express";
import { agentTokens } from "@agent-tokens/express";

const app = express();
app.use(express.json());

// Parse Agent-Token and enforce strict allowlist if at.intent.v1 is present.
app.use(agentTokens({ required: true, requireIntent: true, enforceIntentScope: "strict" }));

app.get("/weather", (_req, res) => {
  res.json({ ok: true, forecast: "Sunny with a chance of agentic drift." });
});

app.post("/bank/transfer", (_req, res) => {
  // With strict scope enforcement, this should be blocked before reaching here
  res.json({ ok: true, transferred: 1000000 });
});

app.listen(3000, () => {
  console.log("Example server listening on http://localhost:3000");
});
