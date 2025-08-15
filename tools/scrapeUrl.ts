import ChatService from "@token-ring/chat/ChatService";
import { z } from "zod";
import type { Registry } from "@token-ring/registry";
import ScraperAPIService from "../ScraperAPIService.ts";

export async function execute(
  { url, render, countryCode, headers }: { url?: string; render?: boolean; countryCode?: string; headers?: Record<string, string> },
  registry: Registry,
): Promise<{ html?: string; error?: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  if (!url) {
    const msg = "[scrapeUrl] url is required";
    chat.errorLine(msg);
    return { error: msg };
  }

  try {
    chat.infoLine(`[scrapeUrl] Fetching ${url} (render=${render ?? false}, country=${countryCode ?? ""})`);
    const html = await scraper.fetchHtml(url, { render, countryCode, headers, outputFormat: "markdown" });
    return { html };
  } catch (e: any) {
    const message = e?.message || String(e);
    chat.errorLine(`[scrapeUrl] Error: ${message}`);
    return { error: message };
  }
}

export const description = "Fetch raw HTML for a URL via ScraperAPI (optionally render JS). Returns { html }.";

export const parameters = z.object({
  url: z.string().url().describe("The URL to fetch"),
  render: z.boolean().optional().describe("Enable JS rendering"),
  countryCode: z.string().optional().describe("Two-letter country code for geotargeting"),
  headers: z.record(z.string()).optional().describe("Optional request headers to forward"),
});
