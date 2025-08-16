import ChatService from "@token-ring/chat/ChatService";
import type { Registry } from "@token-ring/registry";
import { z } from "zod";
import ScraperAPIService from "../ScraperAPIService.ts";

/**
 * Executes the scrapeUrl tool.
 * All chat output is prefixed with "[scrapeUrl]".
 * Errors are thrown as exceptions.
 */
export const name = "scraperapi/scrapeUrl";

export async function execute(
  {
    url,
    render,
    countryCode,
    headers,
  }: {
    url?: string;
    render?: boolean;
    countryCode?: string;
    headers?: Record<string, string>;
  },
  registry: Registry,
): Promise<{ html: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  // Validate required parameters
  if (!url) {
    throw new Error(`[${name}] url is required`);
  }

  try {
    chat.infoLine(`[${name}] Fetching ${url} (render=${render ?? false}, country=${countryCode ?? ""})`);
    const html = await scraper.fetchHtml(url, {
      render,
      countryCode,
      headers,
      outputFormat: "markdown",
    });
    return { html };
  } catch (e: any) {
    const message = e?.message || String(e);
    // Propagate error with tool name prefix
    throw new Error(`[${name}] ${message}`);
  }
}

export const description = "Fetch raw HTML for a URL via ScraperAPI (optionally render JS). Returns { html }.";

export const parameters = z.object({
  url: z.string().url().describe("The URL to fetch"),
  render: z.boolean().optional().describe("Enable JS rendering"),
  countryCode: z.string().optional().describe("Two-letter country code for geotargeting"),
  headers: z.record(z.string()).optional().describe("Optional request headers to forward"),
});
