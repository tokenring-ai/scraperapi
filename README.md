# ScraperAPI Package Documentation

## Overview

The `@tokenring-ai/scraperapi` package integrates ScraperAPI into the Token Ring AI ecosystem, providing robust web
scraping capabilities. It enables fetching raw HTML from web pages (with optional JavaScript rendering), structured
Google Search Engine Results Pages (SERP), and Google News results. This package extends the `WebSearchProvider` from
`@tokenring-ai/websearch`, allowing seamless use in AI agents for web search, news aggregation, and content extraction.
It handles proxying, geotargeting, retries, and error management to bypass blocks and ensure reliable data retrieval.
The package is designed for use in Node.js environments, focusing on ethical scraping while respecting rate limits and
site policies.

Key features:

- **HTML Fetching**: Retrieve page content with or without JS rendering, supporting desktop/mobile emulation and custom
  headers.
- **Google SERP**: Structured JSON/CSV results including organic results, knowledge graphs, related questions, videos,
  and pagination.
- **Google News**: Structured articles with sources, thumbnails, dates, and pagination.
- **Error Handling**: Standardized errors with status codes and hints; retries via `doFetchWithRetry`.
- **Geotargeting**: Support for country codes, TLDs, and UULE for location-specific results.

This package is part of the Token Ring AI monorepo and is intended for integration into AI agents or chat systems for
real-time web data access.

## Installation/Setup

This package is part of the Token Ring AI monorepo (`pkg/scraperapi`). To use it:

1. Ensure you have a ScraperAPI account and API key (sign up at [scraperapi.com](https://www.scraperapi.com/)).
2. Install dependencies via npm (for the monorepo):
   ```
   npm install
   ```
3. In your Token Ring configuration (e.g., `.tokenring/writer-config.js`), add the ScraperAPI config:
   ```js
   export default {
     // ... other config
     scraperapi: {
       apiKey: process.env.SCRAPERAPI_KEY,  // Required
       countryCode: 'us',                   // Optional (e.g., 'us', 'gb')
       tld: 'com',                          // Optional (e.g., 'com', 'co.uk')
       render: false,                       // Optional (enable JS rendering)
       deviceType: 'desktop'                // Optional ('desktop' or 'mobile')
     }
   };
   ```
4. Set the environment variable `SCRAPERAPI_KEY` in your shell or `.env` file.
5. Register the package in your main application (e.g., `src/tr-writer.ts`):
   ```ts
   import * as ScraperAPIPackage from '@tokenring-ai/scraperapi';
   // Add to registry: await registry.addPackages(ScraperAPIPackage);
   // Initialize service if apiKey is present.
   ```
6. Build and run: `npm run build` followed by your app's start command.

The package uses ESM (`type: "module"`) and requires Node.js 18+.

## Package Structure

- **ScraperAPIWebSearchProvider.ts**: Core implementation class extending `WebSearchProvider`. Handles all API
  interactions with ScraperAPI.
- **index.ts**: Package entry point; exports package info and the main class as `ScraperAPIWebSearchResource`.
- **package.json**: Defines metadata, dependencies, and scripts (e.g., `npm test` for Vitest).
- **LICENSE**: MIT license.
- **README.md**: This documentation.
- **design/**: Internal design documents:
 - **implementation.md**: High-level architecture, tools, and integration notes.
 - **google_serp.md**: SERP API parameters and sample responses.
 - **google_news.md**: News API parameters and sample responses.
 - **endpoint_docs.md**: General ScraperAPI endpoint usage.

No additional configs or binaries; the package is lightweight and modular.

## Core Components

### ScraperAPIWebSearchProvider

The main class, extending `WebSearchProvider` from `@tokenring-ai/websearch`. It provides public methods for searching
and fetching, with private helpers for API calls.

- **Constructor**:
 - `new ScraperAPIWebSearchProvider(config: ScraperAPIWebSearchProviderOptions)`
 - Initializes with required `apiKey`; throws if missing. Stores optional defaults like `countryCode`, `tld`, `render`,
   `deviceType`.

- **Public Methods**:
 - `async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
  - Performs Google SERP search. Maps options to SERP params (e.g., `countryCode`). Returns
    `{ results: GoogleSerpResponse[] }`.
  - Uses `outputFormat: 'json'` by default.
 - `async searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
  - Performs Google News search. Similar to `searchWeb` but uses News endpoint. Returns
    `{ results: GoogleNewsResponse[] }`.
 - `async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`
  - Fetches HTML for a URL. Supports `render` and `countryCode` from options. Returns `{ html: string }`.

- **Private Methods** (Internal Use):
 - `async fetchHtml(url: string, opts: FetchHtmlOptions = {}): Promise<string>`
  - Builds query params (api_key, url, render, country_code, device_type) and fetches via `doFetchWithRetry`. Handles
    errors with status and hint.
 - `async googleSerp(query: string, opts: GoogleSerpOptions = {}): Promise<GoogleSerpResponse>`
  - Constructs SERP endpoint URL with params like `uule`, `num`, `hl`, `gl`, `tbs`, `ie`, `oe`, `start`. Parses JSON
    response.
 - `async googleNews(query: string, opts: GoogleNewsOptions = {}): Promise<GoogleNewsResponse>`
  - Similar to `googleSerp` but for News endpoint. Supports same Google params.
 - `buildQuery(params: Record<string, any>): string`
  - Builds URLSearchParams, skipping undefined/null values.
 - `createSerpEndpointURL(query: string, opts: GoogleSerpOptions)` / `createNewsEndpointURL(...)`
  - Validates query; builds full endpoint URL (e.g., `https://api.scraperapi.com/structured/google/search?...`).

Interactions: Public methods delegate to private ones. All use `doFetchWithRetry` from `@tokenring-ai/utility` for
resilience. Responses are typed interfaces (e.g., `GoogleSerpResponse` includes `organic_results`, `knowledge_graph`,
pagination).

### Interfaces

- `ScraperAPIWebSearchProviderOptions`:
  `{ apiKey: string; countryCode?: string; tld?: string; render?: boolean; deviceType?: 'desktop' | 'mobile'; }`
- `GoogleSerpOptions` / `GoogleNewsOptions`: Google-specific params (e.g., `num?: number; tbs?: string;` for time-based
  search).
- `GoogleSerpResponse`: Structured SERP data (search info, organic results, videos, etc.).
- `GoogleNewsResponse`: News articles with source, title, date, link.
- `FetchHtmlOptions`: `{ render?: boolean; countryCode?: string; headers?: Record<string, string>; }`

## Usage Examples

1. **Basic Web Search (SERP)**:
   ```ts
   import ScraperAPIWebSearchProvider from '@tokenring-ai/scraperapi';

   const provider = new ScraperAPIWebSearchProvider({ apiKey: 'your-api-key' });
   const results = await provider.searchWeb('cherry tomatoes', { countryCode: 'us' });
   console.log(results.results[0].organic_results);  // Array of search results
   ```

2. **Google News Search**:
   ```ts
   const newsResults = await provider.searchNews('Space exploration', { num: 20, tbs: 'w' });  // Past week
   console.log(newsResults.results[0].articles);  // Array of news articles
   ```

3. **Fetch Page HTML with Rendering**:
   ```ts
   const page = await provider.fetchPage('https://example.com', { render: true, countryCode: 'gb' });
   console.log(page.html);  // Rendered HTML string
   ```

In a Token Ring AI agent, tools like `googleSerpSearch` or `scrapeUrl` wrap these methods for agent invocation.

## Configuration Options

- **apiKey** (string, required): Your ScraperAPI key.
- **countryCode** (string, optional): Two-letter ISO code (e.g., 'us', 'gb') for geotargeting.
- **tld** (string, optional): Google TLD (e.g., 'com', 'co.uk'). Defaults to 'com'.
- **render** (boolean, optional): Enable JS rendering (costs extra credits). Defaults to false.
- **deviceType** (string, optional): 'desktop' or 'mobile' for user-agent emulation.
- Google Params (per search): `num` (results count), `tbs` (time filter: 'h' hour, 'd' day, etc.), `hl`/`gl` (
  language/country), `start` (pagination), `uule` (precise location), `ie`/`oe` (encoding, default UTF-8),
  `outputFormat` ('json' or 'csv').

Environment: Set `SCRAPERAPI_KEY` for security. Respect ScraperAPI's rate limits (e.g., 1000 requests/month on free
tier).

## API Reference

- **Class**: `ScraperAPIWebSearchProvider extends WebSearchProvider`
 - Constructor: `(config: ScraperAPIWebSearchProviderOptions) => void`
- **Methods**:
 - `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
 - `searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
 - `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`
- **Types**:
 - `GoogleSerpResponse`:
   `{ search_information: {...}; organic_results: Array<{ position: number; title: string; link: string; ...}>; ... }`
 - `GoogleNewsResponse`:
   `{ search_information: {...}; articles: Array<{ title: string; source: string; link: string; date: string; ...}>; ... }`

For full types, see `ScraperAPIWebSearchProvider.ts`.

## Dependencies

- `@tokenring-ai/ai-client@0.1.0`
- `@tokenring-ai/agent@0.1.0`
- `@tokenring-ai/websearch@0.1.0`
- Dev: `vitest@^3.2.4`, `@vitest/coverage-v8@^3.2.4`

Internal dependency on `@tokenring-ai/utility` for `doFetchWithRetry`.

## Contributing/Notes

- **Testing**: Run `npm test` (Vitest) for unit tests. Integration tests require `SCRAPERAPI_KEY`. Mock HTTP for
  reliability.
- **Building**: `npm run build` (TypeScript to JS).
- **Limitations**:
 - Subject to ScraperAPI credits and rate limits.
 - Binary files and .gitignore'd paths are skipped in searches (text-only).
 - Ethical use: Honor robots.txt; avoid high-frequency scraping. Cache results where possible.
 - No built-in caching or advanced parsing; extend for specific needs.
- **Design Docs**: See `design/` folder for API details, parameters, and sample responses.
- Contributions: Fork the monorepo, add tests, and submit PRs. Focus on reliability and TypeScript types.

For issues, reference ScraperAPI
docs: [structured/google/search](https://www.scraperapi.com/documentation/structured-data/google-search-serp-api/), [google/news](https://www.scraperapi.com/documentation/structured-data/google-news-api/), [endpoint](https://www.scraperapi.com/documentation/).
Version: 0.1.0 (MIT License).