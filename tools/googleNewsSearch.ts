import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import ScraperAPIService from "../ScraperAPIService.ts";

// Exported tool name in the required format
export const name = "scraperapi/googleNewsSearch";

/**
 * Result type returned by ScraperAPIService.googleNews.
 * It can be a JSON object (parsed) or a CSV string when `outputFormat` is "csv".
 */
export type GoogleNewsResult = string | Record<string, unknown>;

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
): Promise<{ results?: GoogleNewsResult }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  // Validate required parameters
  if (!query) {
    const errMsg = "query is required";
    // Throw error instead of returning or printing via chatService
    throw new Error(`[${name}] ${errMsg}`);
  }

  // Informational message using the required format
  chat.infoLine(`[${name}] Searching news: ${query}`);
  const results = await scraper.googleNews(query, {
    countryCode,
    tld,
    outputFormat,
  });
  return {results};
}

export const description = "Google News structured search via ScraperAPI. Returns structured JSON (or CSV string).";

export const inputSchema = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Two-letter country code"),
  tld: z.string().optional().describe("Google domain TLD, e.g. com, co.uk"),
  outputFormat: z.enum(["json", "csv"]).optional().describe("Output format: json (default) or csv"),
});
