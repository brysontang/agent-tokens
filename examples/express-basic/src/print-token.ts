import { encodeAgentTokenV0, AT_INTENT_V1, sha256PromptHash } from "@agent-tokens/core";

const prompt = "What's the weather in Maui this week?";

const env = {
  v: 0 as const,
  pkgs: {
    [AT_INTENT_V1]: {
      mode: "strict",
      intentId: "01J0DEMOINTENT0000000000",
      goal: "Get the weather forecast for Maui",
      promptHash: sha256PromptHash(prompt),
      allow: [
        { methods: ["GET"], pathPrefix: "/weather" }
      ],
      exp: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
  }
};

const token = encodeAgentTokenV0(env);
console.log(token);
