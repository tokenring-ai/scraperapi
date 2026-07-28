import type TokenRingApp from "@tokenring-ai/app";
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

/** Builds the provider, or returns undefined when the API key resolves to no value. */
function buildProvider(app: TokenRingApp, config: z.output<typeof packageConfigSchema>): ScraperAPIWebSearchProvider | undefined {
  const { scraperapi } = config;

  const apiKey = resolveSecret(app, scraperapi.apiKey);
  if (!apiKey) return undefined;

  return new ScraperAPIWebSearchProvider({ ...scraperapi, apiKey });
}

export default {
  name: packageJSON.name,
  displayName: "ScraperAPI Integration",
  version: packageJSON.version,
  description: packageJSON.description,
  install(_app) {
    // Provider is built and registered in reconfigure once secrets/config are applied.
  },
  reconfigure(app, config) {
    const provider = buildProvider(app, config);
    app.waitForService(WebSearchService, webSearchService => {
      if (provider) {
        webSearchService.registerProvider("scraperapi", provider);
      } else {
        webSearchService.unregisterProvider("scraperapi");
      }
    });
  },
  configSchema: packageConfigSchema,
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
