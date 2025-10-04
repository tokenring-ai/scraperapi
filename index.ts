import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {WebSearchConfigSchema, WebSearchService} from "@tokenring-ai/websearch";
import packageJSON from './package.json' with {type: 'json'};
import ScraperAPIWebSearchProvider, {ScraperAPIWebSearchProviderOptionsSchema} from "./ScraperAPIWebSearchProvider.ts";

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const websearchConfig = agentTeam.getConfigSlice("websearch", WebSearchConfigSchema);

    if (websearchConfig) {
      agentTeam.services.waitForItemByType(WebSearchService).then(cdnService => {
        for (const name in websearchConfig.providers) {
          const provider = websearchConfig.providers[name];
          if (provider.type === "scraperapi") {
            cdnService.registerProvider(name, new ScraperAPIWebSearchProvider(ScraperAPIWebSearchProviderOptionsSchema.parse(provider)));
          }
        }
      });
    }
  },
};

export {default as ScraperAPIWebSearchProvider} from "./ScraperAPIWebSearchProvider.ts";