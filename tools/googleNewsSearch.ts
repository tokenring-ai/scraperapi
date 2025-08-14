import ChatService from "@token-ring/chat/ChatService";
import { z } from "zod";
import type { Registry } from "@token-ring/registry";
import ScraperAPIService from "../ScraperAPIService.ts";

export async function execute(
  { query, countryCode, tld, outputFormat = "json", googleParams = {} }: { query?: string; countryCode?: string; tld?: string; outputFormat?: "json" | "csv"; googleParams?: Record<string, string | number> },
  registry: Registry,
): Promise<{ results?: any; error?: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  if (!query) {
    const msg = "[googleNewsSearch] query is required";
    chat.errorLine(msg);
    return { error: msg };
  }

  try {
    chat.infoLine(`[googleNewsSearch] Searching news: ${query}`);
    const results = await scraper.googleNews(query, { countryCode, tld, outputFormat, googleParams });
    return { results };
  } catch (e: any) {
    const message = e?.message || String(e);
    chat.errorLine(`[googleNewsSearch] Error: ${message}`);
    return { error: message };
  }
}

export const description = "Google News structured search via ScraperAPI. Returns structured JSON (or CSV string).";

export const parameters = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Two-letter country code"),
  tld: z.string().optional().describe("Google domain TLD, e.g. com, co.uk"),
  outputFormat: z.enum(["json","csv"]).optional().describe("Output format: json (default) or csv"),
  googleParams: z.record(z.union([z.string(), z.number()])).optional().describe("Additional Google parameters (UULE, NUM, HL, GL, TBS, IE, OE, START)")
});
