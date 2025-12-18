import TokenRingApp from "@tokenring-ai/app";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {WebSearchConfigSchema, WebSearchService} from "@tokenring-ai/websearch";
import packageJSON from './package.json' with {type: 'json'};
import ScraperAPIWebSearchProvider, {ScraperAPIWebSearchProviderOptionsSchema} from "./ScraperAPIWebSearchProvider.ts";


export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const websearchConfig = app.getConfigSlice("websearch", WebSearchConfigSchema);

    if (websearchConfig) {
      app.waitForService(WebSearchService, cdnService => {
        for (const name in websearchConfig.providers) {
          const provider = websearchConfig.providers[name];
          if (provider.type === "scraperapi") {
            cdnService.registerProvider(name, new ScraperAPIWebSearchProvider(ScraperAPIWebSearchProviderOptionsSchema.parse(provider)));
          }
        }
      });
    }
  },
} as TokenRingPlugin;
