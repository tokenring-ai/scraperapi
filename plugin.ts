import type { TokenRingPlugin } from "@tokenring-ai/app";
import { WebSearchService } from "@tokenring-ai/websearch";
import { z } from "zod";
import packageJSON from "./package.json" with { type: "json" };
import ScraperAPIWebSearchProvider from "./ScraperAPIWebSearchProvider.ts";
import { ScraperAPIWebSearchProviderOptionsSchema } from "./schema.ts";

const packageConfigSchema = z.object({
  scraperapi: ScraperAPIWebSearchProviderOptionsSchema.exactOptional(),
});

export default {
  name: packageJSON.name,
  displayName: "ScraperAPI Integration",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (process.env.SCRAPERAPI_API_KEY) {
      config.scraperapi ??= {
        apiKey: process.env.SCRAPERAPI_API_KEY,
      };
    }

    const { scraperapi } = config;
    if (scraperapi) {
      app.waitForService(WebSearchService, webSearchService => {
        webSearchService.registerProvider("scraperapi", new ScraperAPIWebSearchProvider(scraperapi));
      });
    }
  },
  configSchema: packageConfigSchema,
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
