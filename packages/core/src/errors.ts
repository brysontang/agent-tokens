export class AgentTokenError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AgentTokenError";
    this.code = code;
  }
}
