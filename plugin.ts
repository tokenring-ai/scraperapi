import {TokenRingPlugin} from "@tokenring-ai/app";
import {WebSearchConfigSchema, WebSearchService} from "@tokenring-ai/websearch";
import {z} from "zod";
import packageJSON from './package.json' with {type: 'json'};
import ScraperAPIWebSearchProvider, {ScraperAPIWebSearchProviderOptionsSchema} from "./ScraperAPIWebSearchProvider.ts";

const packageConfigSchema = z.object({
  websearch: WebSearchConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (config.websearch) {
      app.waitForService(WebSearchService, cdnService => {
        for (const name in config.websearch!.providers) {
          const provider = config.websearch!.providers[name];
          if (provider.type === "scraperapi") {
            cdnService.registerProvider(name, new ScraperAPIWebSearchProvider(ScraperAPIWebSearchProviderOptionsSchema.parse(provider)));
          }
        }
      });
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
