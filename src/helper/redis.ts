import { error } from "console";

const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken} `,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Error executing Redis Command: ${response.statusText}`);
  }

  const data = (await response.json()) as { result: string | null };
  return data.result;
}
