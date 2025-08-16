import ChatService from "@token-ring/chat/ChatService";
import type { Registry } from "@token-ring/registry";
import { z } from "zod";
import ScraperAPIService from "../ScraperAPIService.ts";

// Exported tool name in the required format
export const name = "scraperapi/googleNewsSearch";

export async function execute(
  {
    query,
    countryCode,
    tld,
    outputFormat = "json",
    googleParams = {},
  }: {
    query?: string;
    countryCode?: string;
    tld?: string;
    outputFormat?: "json" | "csv";
    googleParams?: Record<string, string | number>;
  },
  registry: Registry,
): Promise<{ results?: any }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  // Validate required parameters
  if (!query) {
    const errMsg = "query is required";
    // Throw error instead of returning or printing via chatService
    throw new Error(`[${name}] ${errMsg}`);
  }

  try {
    // Informational message using the required format
    chat.infoLine(`[${name}] Searching news: ${query}`);
    const results = await scraper.googleNews(query, {
      countryCode,
      tld,
      outputFormat,
      googleParams,
    });
    return { results };
  } catch (e: any) {
    const message = e?.message || String(e);
    // Throw error with proper prefix
    throw new Error(`[${name}] Error: ${message}`);
  }
}

export const description = "Google News structured search via ScraperAPI. Returns structured JSON (or CSV string).";

export const parameters = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Two-letter country code"),
  tld: z.string().optional().describe("Google domain TLD, e.g. com, co.uk"),
  outputFormat: z.enum(["json", "csv"]).optional().describe("Output format: json (default) or csv"),
  googleParams: z
    .record(z.union([z.string(), z.number()]))
    .optional()
    .describe(
      "Additional Google parameters (UULE, NUM, HL, GL, TBS, IE, OE, START)"
    ),
});
