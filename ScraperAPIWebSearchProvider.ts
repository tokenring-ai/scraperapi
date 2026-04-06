import {doFetchWithRetry} from "@tokenring-ai/utility/http/doFetchWithRetry";
import WebSearchProvider, {
  KnowledgeGraph,
  NewsSearchResult,
  type WebPageOptions,
  type WebPageResult,
  type WebSearchProviderOptions,
  type WebSearchResult
} from "@tokenring-ai/websearch/WebSearchProvider";
import type {ScraperAPIWebSearchProviderOptions} from "./schema.ts";

export interface GoogleSerpOptions {
  countryCode?: string;
  tld?: string;
  outputFormat?: "json" | "csv";
  uule?: string;
  num?: number;
  hl?: string;
  gl?: string;
  tbs?: string;
  ie?: string;
  oe?: string;
  start?: number;
}

export interface GoogleNewsOptions {
  countryCode?: string;
  tld?: string;
  outputFormat?: "json" | "csv";
  uule?: string;
  num?: number;
  hl?: string;
  gl?: string;
  tbs?: string;
  ie?: string;
  oe?: string;
  start?: number;
}

type ScraperAPIKnowledgeGraph = {
  position: number;
  title: string;
  image?: string;
  description: string;
};

export interface GoogleSerpResponse {
  search_information: {
    query_displayed: string;
    total_results?: number;
    time_taken_displayed?: number;
  };
  knowledge_graph?: ScraperAPIKnowledgeGraph;
  organic_results: Array<{
    position: number;
    title: string;
    snippet: string;
    highlights?: string[];
    link: string;
    displayed_link: string;
  }>;
  related_questions?: Array<{
    question: string;
    position: number;
  }>;
  videos?: Array<{
    position: number;
    link: string;
    title: string;
    source: string;
    channel: string;
    publish_date: string;
    thumbnail: string;
    duration: string;
  }>;
  pagination: {
    pages_count: number;
    current_page: number;
    next_page_url?: string;
    prev_page_url?: string;
    pages: Array<{
      page: number;
      url: string;
    }>;
  };
}

export interface GoogleNewsResponse {
  search_information: {
    query_displayed: string;
    total_results: number;
    time_taken_displayed: number;
  };
  articles: Array<{
    source: string;
    thumbnail?: string;
    title: string;
    description: string;
    date: string;
    link: string;
  }>;
  pagination: {
    pagesCount: number;
    currentPage: number;
    nextPageUrl?: string;
    prevPageUrl?: string;
    pages: Array<{
      page: number;
      url: string;
    }>;
  };
}

export default class ScraperAPIWebSearchProvider extends WebSearchProvider {
  constructor(readonly config: ScraperAPIWebSearchProviderOptions) {
    super();
  }


  async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult> {
    const results = await this.googleSerp(query, {
      countryCode: options?.countryCode,
      tld: "com",
      outputFormat: "json",
    });

    return {
      organic: results.organic_results,
      knowledgeGraph: results.knowledge_graph
        ? (({position, title, image, description}: ScraperAPIKnowledgeGraph) => {
            return {
              position,
              title,
              imageUrl: image,
              description,
            } as KnowledgeGraph;
          })(results.knowledge_graph)
        : undefined,
      relatedSearches: results.related_questions?.map(({question, position}) => ({query: question, position})),
    };
  }

  async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult> {
    const results = await this.googleNews(query, {
      countryCode: options?.countryCode,
      tld: "com",
      outputFormat: "json",
    });
    return {
      news: results.articles
    };
  }

  async fetchPage(url: string, opts: WebPageOptions): Promise<WebPageResult> {
    if (!url) throw Object.assign(new Error("url is required"), {status: 400});
    const params = {
      api_key: this.config.apiKey,
      url,
      render: opts.render ?? this.config.render ?? false,
      country_code: opts.countryCode ?? this.config.countryCode,
      device_type: opts.deviceType ?? this.config.deviceType,
      output_format: "markdown",
    };

    const qs = this.buildQuery(params);
    const endpoint = `https://api.scraperapi.com/?${qs}`;
    const res = await doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI HTML fetch failed (${res.status})`), {
        status: res.status,
        hint: text.slice(0, 200),
      });
    }
    return {
      markdown: await res.text()
    };
  }

  private async googleSerp(query: string, opts: GoogleSerpOptions = {}): Promise<GoogleSerpResponse> {
    const endpoint = this.createSerpEndpointURL(query, opts);
    const res = await doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI SERP failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200)
      });
    }

    return await res.json();
  }

  private async googleNews(query: string, opts: GoogleNewsOptions = {}): Promise<GoogleNewsResponse> {
    const endpoint = this.createNewsEndpointURL(query, opts);
    const res = await doFetchWithRetry(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(new Error(`ScraperAPI News failed (${res.status})`), {
        status: res.status,
        hint: text?.slice(0, 200)
      });
    }
    return await res.json();
  }

  private buildQuery(params: Record<string, any>): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      sp.set(k, String(v));
    }
    return sp.toString();
  }

  private createSerpEndpointURL(query: string, opts: GoogleSerpOptions) {
    if (!query) throw Object.assign(new Error("query is required"), {status: 400});
    const baseParams: Record<string, any> = {
      api_key: this.config.apiKey,
      query,
      country_code: opts.countryCode ?? this.config.countryCode,
      tld: opts.tld ?? this.config.tld ?? "com",
      output_format: opts.outputFormat ?? "json",
      uule: opts.uule,
      num: opts.num,
      hl: opts.hl,
      gl: opts.gl,
      tbs: opts.tbs,
      ie: opts.ie,
      oe: opts.oe,
      start: opts.start,
    };

    const qs = this.buildQuery(baseParams);
    return `https://api.scraperapi.com/structured/google/search?${qs}`;
  }

  private createNewsEndpointURL(query: string, opts: GoogleNewsOptions) {
    if (!query) throw Object.assign(new Error("query is required"), {status: 400});
    const baseParams: Record<string, any> = {
      api_key: this.config.apiKey,
      query,
      country_code: opts.countryCode ?? this.config.countryCode,
      tld: opts.tld ?? this.config.tld ?? "com",
      output_format: opts.outputFormat ?? "json",
      uule: opts.uule,
      num: opts.num,
      hl: opts.hl,
      gl: opts.gl,
      tbs: opts.tbs,
      ie: opts.ie,
      oe: opts.oe,
      start: opts.start,
    };

    const qs = this.buildQuery(baseParams);
    return `https://api.scraperapi.com/structured/google/news?${qs}`;
  }
}