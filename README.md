# @token-ring/scraperapi

ScraperAPI integration for the Token Ring ecosystem. This package provides:

- A ScraperAPIService for fetching raw HTML and structured Google results (SERP and News)
- Agent tools for programmatic access: scrapeUrl, googleSerpSearch, googleNewsSearch
- A chat command /scraper for quick manual scrapes from the CLI

## Features

- Fetch raw HTML from any URL via ScraperAPI (optional JavaScript rendering)
- Structured Google Search and Google News results via ScraperAPI structured endpoints
- Built-in retries with exponential backoff on 429/5xx
- Simple tools interface for LLM agents and a convenient chat command for humans

## Installation & Registration

This package is part of the Token Ring workspace and is auto-registered by tr-writer when added to the Registry. In the writer app (src/tr-writer.ts), the package and tools are added, and the service is conditionally initialized when a ScraperAPI apiKey is provided in the writer config.

## Configuration

Add a scraperapi section to your .tokenring/writer-config.{js,cjs,mjs} file:

```js
export default {
  // ...other settings
  defaults: {
    persona: 'writer',
    // Enable tools explicitly or omit to let tr-writer enable defaults
    tools: [
      'scrapeUrl',
      'googleSerpSearch',
      'googleNewsSearch',
    ],
  },
  scraperapi: {
    apiKey: process.env.SCRAPERAPI_KEY,
    countryCode: 'us', // optional default
    tld: 'com',        // optional default for Google endpoints
    outputFormat: 'json', // 'json' | 'csv' (Google endpoints)
    render: false,        // default rendering behavior for fetchHtml
    deviceType: 'desktop' // 'desktop' | 'mobile' (optional)
  }
}
```

Environment variable: set SCRAPERAPI_KEY in your shell or .env before launching tr-writer.

## Chat Command

- /scraper [action] [options...]
  - Actions:
    - url <url> — Fetch HTML content from a URL
    - serp <query> — Search Google SERP
    - news <query> — Search Google News
  - Common options:
    - --country <code>
    - --tld <tld> (serp/news)
    - --output json|csv (serp/news)
    - --render (url)

Examples:

```text
/scraper url https://example.com --render
/scraper serp "TypeScript tutorial" --country US --tld com
/scraper news "AI development" --country US --tld com --output json
```

## Agent Tools

These tools are exported via pkg/scraperapi/tools.ts and can be enabled for agents.

- scrapeUrl
  - Parameters: { url: string; render?: boolean; countryCode?: string; headers?: Record<string,string> }
  - Returns: { html } on success
- googleSerpSearch
  - Parameters: { query: string; countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }
  - Returns: { results } (JSON object for json format; string for csv)
- googleNewsSearch
  - Parameters: { query: string; countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }
  - Returns: { results } (JSON object for json format; string for csv)

## Service API

ScraperAPIService config:
- apiKey (required)
- countryCode? (default geotargeting)
- tld? (e.g. "com", "co.uk")
- outputFormat? ('json' | 'csv' for Google endpoints)
- render? (default for fetchHtml)
- deviceType? ('desktop' | 'mobile')

Methods:
- fetchHtml(url, opts?: { render?: boolean; countryCode?: string; headers?: Record<string,string> }): Promise<string>
- googleSerp(query, opts?: { countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }): Promise<any>
- googleNews(query, opts?: { countryCode?: string; tld?: string; outputFormat?: 'json'|'csv'; googleParams?: Record<string,string|number> }): Promise<any>

Errors are thrown with informative messages and include HTTP status and short hints where available.

## Notes

- Respect ScraperAPI account limits and target site policies
- Retries with backoff are applied automatically on 429 and 5xx responses
- For csv outputFormat, methods return the raw CSV string
