import {Service} from "@token-ring/registry";
import {doFetchWithRetry} from "@token-ring/utility/doFetchWithRetry";

export type ScraperAPIConfig = {
  apiKey: string;
  countryCode?: string;
  tld?: string;
  render?: boolean;
  deviceType?: "desktop" | "mobile";
};

export default class ScraperAPIService extends Service {
  name = "ScraperAPI";
  description = "Service for fetching HTML and structured Google results via ScraperAPI";

  private config: ScraperAPIConfig;

  constructor(config: ScraperAPIConfig) {
    super();
    if (!config?.apiKey) throw new Error("ScraperAPIService requires apiKey");
    this.config = config;
  }

  async fetchHtml(url: string, opts: {
    render?: boolean;
    countryCode?: string;
    outputFormat?: string,
    headers?: Record<string, string>
  } = {}): Promise<string> {
    if (!url) throw Object.assign(new Error("url is required"), {status: 400});
    const params = {
      api_key: this.config.apiKey,
      url,
      render: opts.render ?? this.config.render ?? false,
      country_code: opts.countryCode ?? this.config.countryCode,
      output_format: opts.outputFormat ?? "markdown",
      device_type: this.config.deviceType,
    };

    const qs = this.buildQuery(params);
    const endpoint = `https://api.scraperapi.com/?${qs}`;
    const res = await doFetchWithRetry(endpoint, {headers: opts.headers});
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI HTML fetch failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200),
      });
    }
    return await res.text();
  }

  async googleSerp(query: string, opts: {
    countryCode?: string;
    tld?: string;
    outputFormat?: "json" | "csv";
    googleParams?: Record<string, string | number>
  } = {}): Promise<any> {
    const endpoint = this.createEndpointURL(query, opts);
    const res = await doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI SERP failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200)
      });
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // if csv
    }
  }

  async googleNews(query: string, opts: {
    countryCode?: string;
    tld?: string;
    outputFormat?: "json" | "csv";
    googleParams?: Record<string, string | number>
  } = {}): Promise<any> {

    const endpoint = this.createEndpointURL(query, opts);
    const res = await doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI News failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200)
      });
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // if csv
    }
  }

  private buildQuery(params: Record<string, any>): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      sp.set(k, String(v));
    }
    return sp.toString();
  }




  private createEndpointURL(query: string, opts: {
    countryCode?: string;
    tld?: string;
    outputFormat?: "json" | "csv";
    googleParams?: Record<string, string | number>
  }) {
    if (!query) throw Object.assign(new Error("query is required"), {status: 400});
    const baseParams: Record<string, any> = {
      api_key: this.config.apiKey,
      query,
      country_code: opts.countryCode ?? this.config.countryCode,
      tld: opts.tld ?? this.config.tld ?? "com",
      output_format: opts.outputFormat ?? "json",
      ...(opts.googleParams || {}),
    };

    const qs = this.buildQuery(baseParams);
    return `https://api.scraperapi.com/structured/google/search?${qs}`;
  }
}
