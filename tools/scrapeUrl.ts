import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
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
  }: {
    url?: string;
    render?: boolean;
    countryCode?: string;
  },
  registry: Registry,
): Promise<{ html: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const scraper = registry.requireFirstServiceByType(ScraperAPIService);

  // Validate required parameters
  if (!url) {
    throw new Error(`[${name}] url is required`);
  }

  chat.infoLine(`[${name}] Fetching ${url} (render=${render ?? false}, country=${countryCode ?? ""})`);
  const html = await scraper.fetchHtml(url, {
    render,
    countryCode,
    outputFormat: "markdown",
  });
  return {html};
}

export const description = "Fetch raw HTML for a URL via ScraperAPI (optionally render JS). Returns { html }.";

export const inputSchema = z.object({
  url: z.string().describe("The URL to fetch"),
  render: z.boolean().optional().describe("Enable JS rendering"),
  countryCode: z.string().optional().describe("Two-letter country code for geotargeting"),
});
