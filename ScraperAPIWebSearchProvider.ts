import { HTTPRetriever } from "@tokenring-ai/utility/http/HTTPRetriever";
import type {
  KnowledgeGraph,
  NewsSearchResult,
  WebPageOptions,
  WebPageResult,
  WebSearchProvider,
  WebSearchProviderOptions,
  WebSearchResult,
} from "@tokenring-ai/websearch/WebSearchProvider";
import { z } from "zod";
import type { ScraperAPIWebSearchProviderOptions } from "./schema.ts";

export type GoogleSerpOptions = {
  countryCode?: string | undefined;
  tld?: string | undefined;
  outputFormat?: "json" | "csv";
  uule?: string | undefined;
  num?: number | undefined;
  hl?: string | undefined;
  gl?: string | undefined;
  tbs?: string | undefined;
  ie?: string | undefined;
  oe?: string | undefined;
  start?: number | undefined;
};

export interface GoogleNewsOptions {
  countryCode?: string | undefined;
  tld?: string | undefined;
  outputFormat?: "json" | "csv";
  uule?: string | undefined;
  num?: number | undefined;
  hl?: string | undefined;
  gl?: string | undefined;
  tbs?: string | undefined;
  ie?: string | undefined;
  oe?: string | undefined;
  start?: number | undefined;
}

const ScraperAPIKnowledgeGraphSchema = z
  .object({
    position: z.number(),
    title: z.string(),
    image: z.string().optional(),
    description: z.string(),
  })
  .loose();

type ScraperAPIKnowledgeGraph = z.output<typeof ScraperAPIKnowledgeGraphSchema>;

const GoogleSerpResponseSchema = z
  .object({
    search_information: z
      .object({
        query_displayed: z.string(),
        total_results: z.number().optional(),
        time_taken_displayed: z.number().optional(),
      })
      .loose(),
    knowledge_graph: ScraperAPIKnowledgeGraphSchema.optional(),
    organic_results: z.array(
      z
        .object({
          position: z.number(),
          title: z.string(),
          snippet: z.string(),
          highlights: z.array(z.string()).optional(),
          link: z.string(),
          displayed_link: z.string(),
        })
        .loose(),
    ),
    related_questions: z
      .array(
        z
          .object({
            question: z.string(),
            position: z.number(),
          })
          .loose(),
      )
      .optional(),
    videos: z
      .array(
        z
          .object({
            position: z.number(),
            link: z.string(),
            title: z.string(),
            source: z.string(),
            channel: z.string(),
            publish_date: z.string(),
            thumbnail: z.string(),
            duration: z.string(),
          })
          .loose(),
      )
      .optional(),
    pagination: z
      .object({
        pages_count: z.number(),
        current_page: z.number(),
        next_page_url: z.string().optional(),
        prev_page_url: z.string().optional(),
        pages: z.array(
          z
            .object({
              page: z.number(),
              url: z.string(),
            })
            .loose(),
        ),
      })
      .loose(),
  })
  .loose();

export type GoogleSerpResponse = z.output<typeof GoogleSerpResponseSchema>;

const GoogleNewsResponseSchema = z
  .object({
    search_information: z
      .object({
        query_displayed: z.string(),
        total_results: z.number(),
        time_taken_displayed: z.number(),
      })
      .loose(),
    articles: z.array(
      z
        .object({
          source: z.string(),
          thumbnail: z.string().optional(),
          title: z.string(),
          description: z.string(),
          date: z.string(),
          link: z.string(),
        })
        .loose(),
    ),
    pagination: z
      .object({
        pagesCount: z.number(),
        currentPage: z.number(),
        nextPageUrl: z.string().optional(),
        prevPageUrl: z.string().optional(),
        pages: z.array(
          z
            .object({
              page: z.number(),
              url: z.string(),
            })
            .loose(),
        ),
      })
      .loose(),
  })
  .loose();

export type GoogleNewsResponse = z.output<typeof GoogleNewsResponseSchema>;

export default class ScraperAPIWebSearchProvider implements WebSearchProvider {
  private readonly retriever: HTTPRetriever;

  constructor(readonly config: ScraperAPIWebSearchProviderOptions) {
    this.retriever = new HTTPRetriever({
      baseUrl: "https://api.scraperapi.com",
      headers: {},
      timeout: 10_000,
    });
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
        ? (({ position, title, image, description }: ScraperAPIKnowledgeGraph) => {
            return {
              position,
              title,
              imageUrl: image,
              description,
            } as KnowledgeGraph;
          })(results.knowledge_graph)
        : undefined,
      relatedSearches: results.related_questions?.map(({ question, position }) => ({ query: question, position })),
    };
  }

  async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult> {
    const results = await this.googleNews(query, {
      countryCode: options?.countryCode,
      tld: "com",
      outputFormat: "json",
    });
    return {
      news: results.articles,
    };
  }

  async fetchPage(url: string, opts: WebPageOptions): Promise<WebPageResult> {
    if (!url) throw Object.assign(new Error("url is required"), { status: 400 });
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
    const markdown = await this.retriever.fetchText({
      url: endpoint,
      context: "ScraperAPI HTML fetch",
      opts: { method: "GET" },
    });
    return {
      markdown,
    };
  }

  private async googleSerp(query: string, opts: GoogleSerpOptions = {}): Promise<GoogleSerpResponse> {
    const endpoint = this.createSerpEndpointURL(query, opts);
    return this.retriever.fetchValidatedJson({
      url: endpoint,
      context: "ScraperAPI SERP",
      opts: { method: "GET" },
      schema: GoogleSerpResponseSchema,
    });
  }

  private async googleNews(query: string, opts: GoogleNewsOptions = {}): Promise<GoogleNewsResponse> {
    const endpoint = this.createNewsEndpointURL(query, opts);
    return this.retriever.fetchValidatedJson({
      url: endpoint,
      context: "ScraperAPI News",
      opts: { method: "GET" },
      schema: GoogleNewsResponseSchema,
    });
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
    if (!query) throw Object.assign(new Error("query is required"), { status: 400 });
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
    if (!query) throw Object.assign(new Error("query is required"), { status: 400 });
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
