import {z} from "zod";

export const ScraperAPIWebSearchProviderOptionsSchema = z.object({
  apiKey: z.string(),
  countryCode: z.string().optional(),
  tld: z.string().optional(),
  render: z.boolean().optional(),
  deviceType: z.enum(["desktop", "mobile"]).optional(),
});
export type ScraperAPIWebSearchProviderOptions = z.infer<typeof ScraperAPIWebSearchProviderOptionsSchema>;