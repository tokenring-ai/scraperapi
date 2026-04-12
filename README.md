# @tokenring-ai/scraperapi

ScraperAPI integration for Token Ring AI - A web search provider that enables structured Google SERP, Google News, and HTML fetching through ScraperAPI.

## Overview

The `@tokenring-ai/scraperapi` package provides a ScraperAPI-based web search provider that integrates with the Token Ring AI platform. It extends the `WebSearchProvider` from `@tokenring-ai/websearch`, offering:

- **Google SERP Search**: Structured search results with organic listings, knowledge graphs, and related questions
- **Google News Search**: Structured news articles with sources, thumbnails, dates, and links
- **HTML Fetching**: Retrieve page content with optional JavaScript rendering and geotargeting
- **Error Handling**: Robust error management with retry logic via `doFetchWithRetry`
- **Geotargeting**: Support for country-specific searches and custom TLDs
- **Plugin Integration**: Automatic registration with Token Ring applications

## Features

### Core Capabilities

- **Web Scraping**: Fetch HTML content from any URL with optional rendering
- **Google Search**: Perform structured SERP searches with comprehensive parameter support
- **Google News**: Retrieve news articles with metadata and thumbnails
- **Geotargeting**: Country-specific searches with support for multiple Google TLDs
- **Structured Data**: JSON responses with consistent response formats

### Configuration Options

- API key authentication
- Country code and TLD customization
- JavaScript rendering toggle
- Device type selection (desktop/mobile)

## Installation

This package is part of the Token Ring AI monorepo. To use it:

```bash
# Install dependencies
bun install
```

## Configuration

### Prerequisites

1. Sign up for a ScraperAPI account at [scraperapi.com](https://www.scraperapi.com/)
2. Obtain your API key

### Plugin Configuration

The package integrates with the Token Ring plugin system. Configure it through your application's websearch configuration:

```typescript
import { defineConfig } from '@tokenring-ai/app';
import scraperapiPackage from '@tokenring-ai/scraperapi';

export default defineConfig({
  websearch: {
    providers: {
      scraperapi: {
        type: "scraperapi",
        apiKey: process.env.SCRAPERAPI_KEY,  // Required
        countryCode: "us",                   // Optional (e.g., 'us', 'gb', 'ca')
        tld: "com",                          // Optional (e.g., 'com', 'co.uk')
        render: false,                       // Optional (enable JS rendering)
        deviceType: "desktop",               // Optional ('desktop' or 'mobile')
      }
    }
  }
});
```

### Configuration Schema

The package uses Zod schema validation for configuration:

```typescript
import { z } from 'zod';

export const ScraperAPIWebSearchProviderOptionsSchema = z.object({
  apiKey: z.string(),                                    // Required
  countryCode: z.string().optional(),                    // Optional
  tld: z.string().optional(),                            // Optional
  render: z.boolean().optional(),                        // Optional
  deviceType: z.enum(["desktop", "mobile"]).optional(),  // Optional
});

export type ScraperAPIWebSearchProviderOptions = z.infer<typeof ScraperAPIWebSearchProviderOptionsSchema>;
```

## Usage

### Basic Usage

```typescript
import ScraperAPIWebSearchProvider from '@tokenring-ai/scraperapi';

// Initialize the provider
const provider = new ScraperAPIWebSearchProvider({
  apiKey: 'your-api-key',
  countryCode: 'us',
  tld: 'com',
  render: false,
  deviceType: 'desktop'
});

// Perform Google SERP search
const searchResults = await provider.searchWeb('cherry tomatoes', {
  countryCode: 'us'
});
console.log(searchResults.organic);
console.log(searchResults.knowledgeGraph);
console.log(searchResults.relatedSearches);

// Search Google News
const newsResults = await provider.searchNews('Space exploration', {
  countryCode: 'us',
  num: 10
});
console.log(newsResults.news);

// Fetch page content
const pageContent = await provider.fetchPage('https://example.com', {
  render: true,
  countryCode: 'gb'
});
console.log(pageContent.markdown);
```

### Google Search Parameters

The package supports comprehensive Google search parameters through the options:

```typescript
// Search with time filter
const recentResults = await provider.searchWeb('technology news', {
  countryCode: 'us',
  gl: 'us'
});

// Search with result limit and pagination
const limitedResults = await provider.searchWeb('AI research', {
  countryCode: 'us',
  num: 20,
  start: 10
});

// News search with time range
const weeklyNews = await provider.searchNews('climate change', {
  countryCode: 'us',
  tbs: 'w'  // Past week
});

// Fetch page with JavaScript rendering
const renderedContent = await provider.fetchPage('https://example.com', {
  render: true,
  countryCode: 'gb'
});
```

## API Reference

### ScraperAPIWebSearchProvider

The main provider class that extends `WebSearchProvider`.

#### Constructor

```typescript
new ScraperAPIWebSearchProvider(config: ScraperAPIWebSearchProviderOptions)
```

**Parameters:**

- `apiKey` (string, required): Your ScraperAPI API key
- `countryCode` (string, optional): Two-letter ISO country code for geotargeting
- `tld` (string, optional): Google TLD (e.g., 'com', 'co.uk')
- `render` (boolean, optional): Enable JavaScript rendering
- `deviceType` (string, optional): Device type ('desktop' or 'mobile')

#### Public Methods

##### searchWeb

```typescript
async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>
```

Performs a Google SERP search and returns structured results.

**Parameters:**

- `query` (string): Search query
- `options` (WebSearchProviderOptions, optional): Search options
  - `countryCode` (string, optional): Country code for geotargeting
  - `gl` (string, optional): Country boost parameter
  - `hl` (string, optional): Host language
  - `num` (number, optional): Number of results
  - `tbs` (string, optional): Time-based search filter
  - `start` (number, optional): Pagination offset

**Returns:** `WebSearchResult` containing:

- `organic`: Array of organic search results
- `knowledgeGraph`: Knowledge graph information (if available)
- `relatedSearches`: Array of related search queries

##### searchNews

```typescript
async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>
```

Performs a Google News search and returns structured results.

**Parameters:**

- `query` (string): Search query
- `options` (WebSearchProviderOptions, optional): Search options

**Returns:** `NewsSearchResult` containing:

- `news`: Array of news articles with source, title, description, date, and link

##### fetchPage

```typescript
async fetchPage(url: string, opts: WebPageOptions): Promise<WebPageResult>
```

Fetches HTML content from a URL using ScraperAPI and returns it in markdown format.

**Parameters:**

- `url` (string): URL to fetch
- `opts` (WebPageOptions): Fetch options
  - `render` (boolean, optional): Enable JavaScript rendering
  - `countryCode` (string, optional): Country code for geotargeting

**Returns:** `WebPageResult` containing:

- `markdown`: Page content in markdown format

#### Private Methods

##### googleSerp

```typescript
private async googleSerp(query: string, opts?: GoogleSerpOptions): Promise<GoogleSerpResponse>
```

Internal method to perform Google SERP searches via ScraperAPI.

**Parameters:**

- `query` (string): Search query
- `opts` (GoogleSerpOptions, optional): Advanced options
  - `countryCode` (string, optional): Country code
  - `tld` (string, optional): Google TLD
  - `outputFormat` ('json' | 'csv', optional): Output format
  - `uule` (string, optional): UULE parameter for location targeting
  - `num` (number, optional): Number of results
  - `hl` (string, optional): Host language
  - `gl` (string, optional): Country boost
  - `tbs` (string, optional): Time-based filter
  - `ie` (string, optional): Input encoding
  - `oe` (string, optional): Output encoding
  - `start` (number, optional): Pagination offset

**Returns:** `GoogleSerpResponse` with structured SERP data

##### googleNews

```typescript
private async googleNews(query: string, opts?: GoogleNewsOptions): Promise<GoogleNewsResponse>
```

Internal method to perform Google News searches via ScraperAPI.

**Parameters:**

- `query` (string): Search query
- `opts` (GoogleNewsOptions, optional): Advanced options (same as GoogleSerpOptions)

**Returns:** `GoogleNewsResponse` with structured news data

### Response Types

The package returns structured data that conforms to the Token Ring websearch API. The underlying ScraperAPI responses are mapped to these standardized types:

#### Google SERP Response Structure

```typescript
interface GoogleSerpResponse {
  search_information: {
    query_displayed: string;
    total_results?: number;
    time_taken_displayed?: number;
  };
  knowledge_graph?: {
    position: number;
    title: string;
    image?: string;
    description: string;
  };
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
```

#### Google News Response Structure

```typescript
interface GoogleNewsResponse {
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
```

## Error Handling

The package provides standardized error handling with detailed error information:

```typescript
try {
  const results = await provider.searchWeb('query');
} catch (error) {
  console.error('Search failed:', error.message);
  console.error('Status code:', error.status);
  console.error('Hint:', error.hint);
  // Handle specific error cases
  if (error.status === 429) {
    console.log('Rate limit exceeded - consider upgrading your plan');
  }
}
```

**Error Types:**

- **400**: Missing required parameters (url, query, apiKey)
- **429**: Rate limit exceeded
- **5xx**: Server errors from ScraperAPI

Errors include:

- `message`: Human-readable error description
- `status`: HTTP status code
- `hint`: First 200 characters of error response body

## Plugin Integration

The package includes automatic plugin integration through the `@tokenring-ai/app` plugin system:

```typescript
// plugin.ts
import { TokenRingPlugin } from "@tokenring-ai/app";
import { WebSearchConfigSchema, WebSearchService } from "@tokenring-ai/websearch";
import { z } from "zod";
import packageJSON from "./package.json" with { type: "json" };
import ScraperAPIWebSearchProvider, { ScraperAPIWebSearchProviderOptionsSchema } from "./ScraperAPIWebSearchProvider.ts";

const packageConfigSchema = z.object({
  websearch: WebSearchConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (config.websearch) {
      app.waitForService(WebSearchService, cdnService => {
        for (const name in config.websearch!.providers) {
          const provider = config.websearch!.providers[name];
          if (provider.type === "scraperapi") {
            cdnService.registerProvider(name, new ScraperAPIWebSearchProvider(ScraperAPIWebSearchProviderOptionsSchema.parse(provider)));
          }
        }
      });
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
```

## Testing

Run the test suite:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## Package Structure

```
pkg/scraperapi/
├── index.ts                           # Package entry point
├── ScraperAPIWebSearchProvider.ts     # Main provider implementation
├── plugin.ts                          # Token Ring plugin integration
├── package.json                       # Package metadata and dependencies
├── README.md                          # This documentation
├── vitest.config.ts                   # Vitest configuration
└── design/                            # Design documentation
    ├── implementation.md              # Implementation design
    ├── endpoint_docs.md               # ScraperAPI endpoint documentation
    ├── google_serp.md                 # Google SERP API documentation
    └── google_news.md                 # Google News API documentation
```

## Rate Limiting and Usage

- **ScraperAPI quotas**: Respects your plan's rate limits
- **429 handling**: Automatic retry with exponential backoff via `doFetchWithRetry`
- **Usage tracking**: Monitor your usage through ScraperAPI dashboard
- **Best practices**: Implement caching for repeated queries

## Google Search Parameters Reference

The package supports the following Google search parameters through ScraperAPI:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `country_code` | Two-letter ISO country code for geotargeting | `us`, `gb`, `ca` |
| `tld` | Google domain TLD | `com`, `co.uk`, `ca` |
| `output_format` | Response format | `json`, `csv` |
| `uule` | Location targeting (UULE parameter) | `w+CAIQICINUGFyaXMsIEZyYW5jZQ` |
| `num` | Number of results | `10`, `20` |
| `hl` | Host language | `en`, `de` |
| `gl` | Country boost | `us`, `de` |
| `tbs` | Time-based filter | `d` (day), `w` (week), `m` (month), `y` (year) |
| `ie` | Input encoding | `UTF8` |
| `oe` | Output encoding | `UTF8` |
| `start` | Pagination offset | `0`, `10`, `20` |

## Ethical Considerations

- **Rate Limits**: Respect ScraperAPI's usage limits and quotas
- **Robots.txt**: The service automatically respects robots.txt directives
- **Frequency**: Avoid high-frequency scraping; implement caching where appropriate
- **Terms of Service**: Comply with ScraperAPI's terms of service and target websites' policies
- **Geographic Targeting**: Use appropriate country codes for targeted content

## Troubleshooting

### Common Issues

1. **Missing API Key**:

   ```typescript
   if (!config?.apiKey) throw new Error("ScraperAPIWebSearchProvider requires apiKey");
   ```

2. **Rate Limiting (429)**:

   ```typescript
   // Check your ScraperAPI plan limits
   // Consider implementing caching
   ```

3. **Country Targeting**:

   ```typescript
   // Verify country code is supported
   // Use both countryCode and tld parameters
   ```

4. **JavaScript Rendering**:

   ```typescript
   // JS rendering consumes more credits
   // Only enable when necessary
   ```

### Performance Optimization

- **Caching**: Implement result caching for repeated queries
- **Batch Processing**: Group similar requests when possible
- **Monitoring**: Track usage and performance metrics
- **Error Handling**: Implement proper error recovery strategies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality (`bun test`)
4. Ensure all tests pass (`bun run test:coverage`)
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Include comprehensive tests for new features
- Update documentation for API changes
- Respect semantic versioning (major.minor.patch)
- Use proper error handling patterns
- Add JSDoc comments for all public APIs

### Code Style

- Use consistent naming conventions
- Implement proper error handling
- Follow existing patterns for plugin integration
- Use Zod schemas for configuration validation
- Include proper TypeScript types

## Support

For issues related to:

- **ScraperAPI service**: Refer to [ScraperAPI documentation](https://www.scraperapi.com/documentation/)
- **Token Ring integration**: Check the main Token Ring repository
- **Package bugs**: Open an issue in this repository
- **Feature requests**: Submit a pull request or issue

### Getting Help

1. Check the troubleshooting section above
2. Review the design documents in `design/`
3. Examine test files for usage examples
4. Open an issue with detailed error information

---

**Version**: 0.2.0
**License**: MIT
**Maintainers**: Token Ring AI Team
