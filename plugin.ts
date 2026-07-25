import type { TokenRingPlugin } from "@tokenring-ai/app";
import { resolveSecret } from "@tokenring-ai/secrets";
import { WebSearchService } from "@tokenring-ai/websearch";
import { z } from "zod";
import packageJSON from "./package.json" with { type: "json" };
import ScraperAPIWebSearchProvider from "./ScraperAPIWebSearchProvider.ts";
import { ScraperAPIWebSearchProviderOptionsSchema } from "./schema.ts";

const packageConfigSchema = z.object({
  scraperapi: ScraperAPIWebSearchProviderOptionsSchema.prefault({}),
});

export default {
  name: packageJSON.name,
  displayName: "ScraperAPI Integration",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    const { scraperapi } = config;

    const apiKey = resolveSecret(app, scraperapi.apiKey);
    if (!apiKey) return;

    app.waitForService(WebSearchService, webSearchService => {
      webSearchService.registerProvider("scraperapi", new ScraperAPIWebSearchProvider({ ...scraperapi, apiKey }));
    });
  },
  configSchema: packageConfigSchema,
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
