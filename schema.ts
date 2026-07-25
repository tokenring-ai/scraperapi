import { fromEnv, secret, type WithResolvedSecrets } from "@tokenring-ai/secrets/secret";
import { z } from "zod";

export const ScraperAPIWebSearchProviderOptionsSchema = z.object({
  apiKey: secret({ description: "ScraperAPI key" }).default(fromEnv("SCRAPERAPI_API_KEY")),
  countryCode: z.string().exactOptional(),
  tld: z.string().exactOptional(),
  render: z.boolean().exactOptional(),
  deviceType: z.enum(["desktop", "mobile"]).exactOptional(),
});
export type ScraperAPIWebSearchProviderOptions = z.infer<typeof ScraperAPIWebSearchProviderOptionsSchema>;

/** Options as handed to the provider, with the API key secret already resolved. */
export type ResolvedScraperAPIWebSearchProviderOptions = WithResolvedSecrets<ScraperAPIWebSearchProviderOptions, "apiKey">;
