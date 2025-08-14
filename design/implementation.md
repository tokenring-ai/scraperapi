ScraperAPI integration design
- The package will be in pkg/scraperapi
- A ScraperAPI service should be created in pkg/scraperapi/ScraperAPIService.js (or .ts)
- The chat command exposed to the user will be called /scraperapi, and should be placed in pkg/scraperapi/chatCommands/scraperapi.js
- Tools should be placed in pkg/scraperapi/tools/{scrapeUrl, googleSerpSearch, googleNewsSearch}.js
- Reference API docs are in:
  - pkg/scraperapi/design/endpoint_docs.md
  - pkg/scraperapi/design/google_serp.md
  - pkg/scraperapi/design/google_news.md

Basic functionality and workflow
- This package gives an AI agent and the user the ability to scrape:
  - Raw HTML of arbitrary pages via ScraperAPI endpoint
  - Structured Google Search (SERP) results
  - Structured Google News results
- It should expose:
  - A /scraper chat command to run quick scrapes from the CLI
  - Tool calls for agents to fetch pages and search/news data

Technical details
- ScraperAPIService should:
  - Accept config with apiKey and optional defaults: countryCode, tld, outputFormat, render, deviceType
  - Provide methods:
    - async fetchHtml(url: string, opts?: { render?: boolean; countryCode?: string; headers?: Record<string,string> }): Promise<string>
    - async googleSerp(query: string, opts?: { countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }): Promise<any>
    - async googleNews(query: string, opts?: { countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }): Promise<any>
  - Handle querystring building and error responses uniformly
  - Respect rate limits and support retries/backoff on 429/5xx
- Tools should wrap these methods and be context-aware:
  - scrapeUrl(url, options) -> returns { html }
  - googleSerpSearch(query, options) -> returns structured results as JSON
  - googleNewsSearch(query, options) -> returns structured results as JSON
- Error handling:
  - Standardized error objects with message, status, and hint
  - Input validation for required fields (apiKey, url/query)

Chat command: /scraper
- Sub-commands:
  - /scraper url <url> [--render] [--country <code>] [--header "K:V"]
  - /scraper serp <query> [--country <code>] [--tld <tld>] [--tbs <range>] [--num <n>] [--output json|csv]
  - /scraper news <query> [--country <code>] [--tld <tld>] [--tbs <range>] [--output json|csv]
- The command should:
  - Parse args, call ScraperAPIService, and display summarized results
  - Offer --save <path> to write raw JSON/HTML to disk via filesystem service

Implementation in TokenRing Writer app
- Package registration (similar to other packages like ghost-io/template):
  - Import the package and service in src/tr-writer.ts:
    ```ts
    import * as ScraperAPIPackage from "@token-ring/scraperapi";
    import { ScraperAPIService } from "@token-ring/scraperapi";
    ```
  - Add the package to the registry alongside others:
    ```ts
    await registry.addPackages(
      // ...existing packages
      ScraperAPIPackage,
    );
    ```
  - Extend the WriterConfig to optionally include scraperapi config:
    ```ts
    interface WriterConfig {
      // ...existing
      scraperapi?: {
        apiKey: string;
        countryCode?: string;
        tld?: string;           // e.g. "com", "co.uk"
        outputFormat?: 'json'|'csv';
        render?: boolean;
      };
    }
    ```
  - Conditionally add the service when apiKey is present (mirrors GhostIOService pattern):
    ```ts
    const scraperConfig = config.scraperapi;
    if (scraperConfig && scraperConfig.apiKey) {
      await registry.services.addServices(new ScraperAPIService(scraperConfig));
    } else if (scraperConfig) {
      console.warn("ScraperAPI configuration detected but missing apiKey. Skipping ScraperAPIService initialization.");
    }
    ```
  - Enable tools by default, unless user overrides defaults.tools:
    ```ts
    const defaultTools = Object.keys({
      // ...existing tools
      ...ScraperAPIPackage.tools,
    });
    ```

Configuration in .tokenring/writer-config.{js,cjs,mjs}
- Minimal example:
  ```js
  export default {
    defaults: {
      persona: 'writer',
      tools: [
        // enable selected tools explicitly or leave undefined to auto-enable
        'scrapeUrl',
        'googleSerpSearch',
        'googleNewsSearch',
      ],
    },
    personas: {},
    models: {},
    templates: {},
    scraperapi: {
      apiKey: process.env.SCRAPERAPI_KEY,
      countryCode: 'us',
      tld: 'com',
      outputFormat: 'json',
      render: false,
    },
  }
  ```
- Environment variable:
  - SCRAPERAPI_KEY should be set in your shell or .env file used to launch tr-writer

Usage examples
- Fetch raw HTML for a page:
  ```text
  /scraper url https://example.com --render
  ```
- Google search (SERP):
  ```text
  /scraper serp "cherry tomatoes" --country gb --tld co.uk --tbs d --num 20
  ```
- Google News:
  ```text
  /scraper news "Space" --country us --tld com --tbs w
  ```

Developer notes
- Refer to:
  - Endpoint method parameters in design/endpoint_docs.md (api_key, url, render, country_code, etc.)
  - SERP parameters in design/google_serp.md (UULE, NUM, HL, GL, TBS, IE, OE, START)
  - News parameters in design/google_news.md
- Rate limiting & retries:
  - Implement exponential backoff on 429 and 5xx with jitter
  - Respect ScraperAPI usage limits from your account
- Testing:
  - Provide unit tests with mocked HTTP responses
  - Integration tests gated by SCRAPERAPI_KEY being present (skip otherwise)
- Ethics & compliance:
  - Honor target site robots directives where applicable via ScraperAPI settings
  - Avoid abusive scrape frequencies; cache results where possible
