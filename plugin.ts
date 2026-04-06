import {TokenRingPlugin} from "@tokenring-ai/app";
import {WebSearchService} from "@tokenring-ai/websearch";
import {z} from "zod";
import packageJSON from './package.json' with {type: 'json'};
import {ScraperAPIWebSearchProviderOptionsSchema} from "./schema.ts";
import ScraperAPIWebSearchProvider from "./ScraperAPIWebSearchProvider.ts";

const packageConfigSchema = z.object({
  scraperapi: ScraperAPIWebSearchProviderOptionsSchema.optional()
});

export default {
  name: packageJSON.name,
  displayName: "ScraperAPI Integration",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (process.env.SCRAPERAPI_API_KEY) {
      config.scraperapi ??= {
        apiKey: process.env.SCRAPERAPI_API_KEY
      };
    }

    if (config.scraperapi) {
      app.waitForService(WebSearchService, webSearchService => {
        webSearchService.registerProvider("scraperapi", new ScraperAPIWebSearchProvider(config.scraperapi!));
      });
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
