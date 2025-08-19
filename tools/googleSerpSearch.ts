import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import ScraperAPIService from "../ScraperAPIService.ts";

// Export tool name in required format
export const name = "scraperapi/googleSerpSearch";

export async function execute(
  {
    query,
    countryCode,
    tld,
    outputFormat = "json",
  }: {
    query?: string;
    countryCode?: string;
    tld?: string;
    outputFormat?: "json" | "csv";
  },
  registry: Registry,
): Promise<{ results: any }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  if (!query) {
    // Throw error instead of returning and avoid printing via chatService
    throw new Error(`[${name}] query is required`);
  }

  chat.infoLine(`[${name}] Searching: ${query}`);
  const results = await scraper.googleSerp(query, {
    countryCode,
    tld,
    outputFormat
  });
  return {results};
}

export const description = "Google SERP structured search via ScraperAPI. Returns structured JSON (or CSV string).";

export const inputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  countryCode: z.string().optional().describe("Two-letter country code"),
  tld: z.string().optional().describe("Google domain TLD, e.g. com, co.uk"),
  outputFormat: z.enum(["json", "csv"]).optional().describe("Output format: json (default) or csv"),
});
