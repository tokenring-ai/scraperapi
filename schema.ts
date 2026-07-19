import { z } from "zod";

export const ScraperAPIWebSearchProviderOptionsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true, description: "ScraperAPI key" }),
  countryCode: z.string().exactOptional(),
  tld: z.string().exactOptional(),
  render: z.boolean().exactOptional(),
  deviceType: z.enum(["desktop", "mobile"]).exactOptional(),
});
export type ScraperAPIWebSearchProviderOptions = z.infer<typeof ScraperAPIWebSearchProviderOptionsSchema>;
