import { Service, type Registry } from "@token-ring/registry";

export type ScraperAPIConfig = {
  apiKey: string;
  countryCode?: string;
  tld?: string;
  outputFormat?: "json" | "csv";
  render?: boolean;
  deviceType?: "desktop" | "mobile";
};

export default class ScraperAPIService extends Service {
  name = "ScraperAPI";
  description = "Service for fetching HTML and structured Google results via ScraperAPI";

  private config: ScraperAPIConfig;
  private registry!: Registry;

  constructor(config: ScraperAPIConfig) {
    super();
    if (!config?.apiKey) throw new Error("ScraperAPIService requires apiKey");
    this.config = config;
  }

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  async stop(_registry: Registry): Promise<void> {}

  private buildQuery(params: Record<string, any>): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      sp.set(k, String(v));
    }
    return sp.toString();
  }

  private async doFetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
    const maxRetries = 3;
    let delay = 500;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (attempt === maxRetries) return res;
        await new Promise((r) => setTimeout(r, delay + Math.floor(Math.random() * 250)));
        delay *= 2;
        continue;
      }
      return res;
    }
    // unreachable
    return await fetch(url, init);
  }

  async fetchHtml(url: string, opts: { render?: boolean; countryCode?: string; headers?: Record<string, string> } = {}): Promise<string> {
    if (!url) throw Object.assign(new Error("url is required"), { status: 400 });
    const params = {
      api_key: this.config.apiKey,
      url,
      render: opts.render ?? this.config.render ?? false,
      country_code: opts.countryCode ?? this.config.countryCode,
      device_type: this.config.deviceType,
    } as Record<string, any>;

    const qs = this.buildQuery(params);
    const endpoint = `https://api.scraperapi.com/?${qs}`;
    const res = await this.doFetchWithRetry(endpoint, { headers: opts.headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI HTML fetch failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200),
      });
    }
    return await res.text();
  }

  async googleSerp(query: string, opts: { countryCode?: string; tld?: string; outputFormat?: "json" | "csv"; googleParams?: Record<string, string | number> } = {}): Promise<any> {
    if (!query) throw Object.assign(new Error("query is required"), { status: 400 });
    const baseParams: Record<string, any> = {
      api_key: this.config.apiKey,
      query,
      country_code: opts.countryCode ?? this.config.countryCode,
      tld: opts.tld ?? this.config.tld ?? "com",
      output_format: opts.outputFormat ?? this.config.outputFormat ?? "json",
      ...(opts.googleParams || {}),
    };

    const qs = this.buildQuery(baseParams);
    const endpoint = `https://api.scraperapi.com/structured/google/search?${qs}`;
    const res = await this.doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI SERP failed (${res.status})`), { status: res.status, hint: text?.slice(0, 200) });
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // if csv
    }
  }

  async googleNews(query: string, opts: { countryCode?: string; tld?: string; outputFormat?: "json" | "csv"; googleParams?: Record<string, string | number> } = {}): Promise<any> {
    if (!query) throw Object.assign(new Error("query is required"), { status: 400 });
    const baseParams: Record<string, any> = {
      api_key: this.config.apiKey,
      query,
      country_code: opts.countryCode ?? this.config.countryCode,
      tld: opts.tld ?? this.config.tld ?? "com",
      output_format: opts.outputFormat ?? this.config.outputFormat ?? "json",
      ...(opts.googleParams || {}),
    };

    const qs = this.buildQuery(baseParams);
    const endpoint = `https://api.scraperapi.com/structured/google/news?${qs}`;
    const res = await this.doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI News failed (${res.status})`), { status: res.status, hint: text?.slice(0, 200) });
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // if csv
    }
  }
}
