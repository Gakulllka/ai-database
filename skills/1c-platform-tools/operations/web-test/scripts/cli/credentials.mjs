// Explicit web-client credentials. Never inspect MCP or other saved service credentials.
export function credentialsFromEnvironment(env = process.env) {
  const username = env.ECC_1C_WEB_USER;
  const password = env.ECC_1C_WEB_PASSWORD;
  if (username === undefined && password === undefined) return null;
  if (!username) throw new Error("ECC_1C_WEB_USER is required when web-client credentials are provided");
  return { username, password: password || "" };
}
