# @tokenring-ai/scraperapi

ScraperAPI integration for Token Ring - A web scraping provider that extends the Token Ring AI ecosystem with robust Google Search and Google News capabilities.

## Overview

The `@tokenring-ai/scraperapi` package provides a ScraperAPI-based web search provider that integrates seamlessly with the Token Ring AI platform. It enables AI agents and applications to perform web searches, fetch structured Google SERP results, and retrieve Google News articles through a unified interface.

This package extends the `WebSearchProvider` from `@tokenring-ai/websearch`, offering:

- **Google SERP Search**: Structured search results with organic listings, knowledge graphs, related questions, videos, and pagination
- **Google News Search**: Structured news articles with sources, thumbnails, dates, and pagination
- **HTML Fetching**: Retrieve page content with optional JavaScript rendering and geotargeting
- **Error Handling**: Robust error management with retry logic via `doFetchWithRetry`
- **Geotargeting**: Support for country-specific searches and custom TLDs

## Installation

This package is part of the Token Ring AI monorepo. To use it:

```bash
# Install dependencies
npm install
```

## Configuration

### Prerequisites

1. Sign up for a ScraperAPI account at [scraperapi.com](https://www.scraperapi.com/)
2. Obtain your API key

### Package Configuration

Add the ScraperAPI configuration to your Token Ring configuration file (e.g., `.tokenring/writer-config.js`):

```javascript
export default {
  // ... other configuration
  websearch: {
    providers: {
      scraperapi: {
        type: "scraperapi",
        apiKey: process.env.SCRAPERAPI_KEY, // Required
        countryCode: "us",                  // Optional (e.g., 'us', 'gb', 'ca')
        tld: "com",                         // Optional (e.g., 'com', 'co.uk')
        render: false,                      // Optional (enable JS rendering)
        deviceType: "desktop"               // Optional ('desktop' or 'mobile')
      }
    }
  }
};
```

### Environment Variables

Set the ScraperAPI key in your environment:

```bash
export SCRAPERAPI_KEY=your_api_key_here
```

## Usage

### Basic Usage

```typescript
import ScraperAPIWebSearchProvider from '@tokenring-ai/scraperapi';

const provider = new ScraperAPIWebSearchProvider({
  apiKey: 'your-api-key',
  countryCode: 'us',
  tld: 'com'
});

// Perform web search
const searchResults = await provider.searchWeb('cherry tomatoes', {
  countryCode: 'us'
});
console.log(searchResults.organic);
console.log(searchResults.knowledgeGraph);

// Search news
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

### Integration with Token Ring

The package automatically integrates with Token Ring applications when properly configured. The plugin system will:

1. Register the ScraperAPI provider with the web search service
2. Enable the provider when configuration is present
3. Make it available to AI agents and chat commands

## API Reference

### ScraperAPIWebSearchProvider

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

#### Methods

##### searchWeb

```typescript
async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>
```

Performs a Google search and returns structured results.

**Parameters:**
- `query` (string): Search query
- `options` (WebSearchProviderOptions, optional): Search options including country code

**Returns:** `WebSearchResult` containing organic results, knowledge graph, and related searches

##### searchNews

```typescript
async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>
```

Performs a Google News search and returns structured results.

**Parameters:**
- `query` (string): Search query
- `options` (WebSearchProviderOptions, optional): Search options including country code

**Returns:** `NewsSearchResult` containing news articles

##### fetchPage

```typescript
async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>
```

Fetches HTML content from a URL.

**Parameters:**
- `url` (string): URL to fetch
- `options` (WebPageOptions, optional): Fetch options including render and country code

**Returns:** `WebPageResult` containing markdown content

### Response Types

#### WebSearchResult

```typescript
interface WebSearchResult {
  organic: Array<{
    position: number;
    title: string;
    snippet: string;
    highlights?: string[];
    link: string;
    displayed_link: string;
  }>;
  knowledgeGraph?: KnowledgeGraph;
  relatedSearches?: Array<{
    query: string;
    position: number;
  }>;
}
```

#### NewsSearchResult

```typescript
interface NewsSearchResult {
  news: Array<{
    source: string;
    thumbnail?: string;
    title: string;
    description: string;
    date: string;
    link: string;
  }>;
}
```

#### WebPageResult

```typescript
interface WebPageResult {
  markdown: string;
}
```

## Google Search Parameters

The package supports various Google search parameters:

### Common Parameters

- `num`: Number of results (default varies)
- `tbs`: Time-based search (`h`=hour, `d`=day, `w`=week, `m`=month, `y`=year)
- `hl`: Host language (e.g., 'en', 'de')
- `gl`: Geographic location boost (e.g., 'us', 'gb')
- `start`: Starting offset for pagination
- `uule`: Precise location encoding

### Usage Examples

```typescript
// Search with time filter
const recentResults = await provider.searchWeb('technology news', {
  countryCode: 'us',
  tbs: 'w'  // Past week
});

// Search with result limit
const limitedResults = await provider.searchWeb('AI research', {
  countryCode: 'us',
  num: 20
});
```

## Error Handling

The package provides standardized error handling:

```typescript
try {
  const results = await provider.searchWeb('query');
} catch (error) {
  console.error('Search failed:', error.message);
  console.error('Status:', error.status);
  console.error('Hint:', error.hint);
}
```

## Dependencies

### Runtime Dependencies

- `@tokenring-ai/chat`: ^0.1.0
- `@tokenring-ai/agent`: ^0.1.0
- `@tokenring-ai/websearch`: ^0.1.0
- `@tokenring-ai/utility`: ^0.1.0

### Development Dependencies

- `vitest`: ^4.0.13
- `@vitest/coverage-v8`: ^4.0.13

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Package Structure

```
pkg/scraperapi/
├── index.ts                    # Package entry point and plugin definition
├── ScraperAPIWebSearchProvider.ts  # Main implementation
├── package.json                # Package metadata and dependencies
├── README.md                   # This documentation
├── LICENSE                     # MIT license
└── design/                     # Internal design documents
    ├── implementation.md       # Architecture and implementation details
    ├── google_serp.md          # SERP API documentation
    ├── google_news.md          # News API documentation
    └── endpoint_docs.md        # General endpoint usage
```

## Ethical Considerations

- **Rate Limits**: Respect ScraperAPI's usage limits and quotas
- **Robots.txt**: The service automatically respects robots.txt directives
- **Frequency**: Avoid high-frequency scraping; implement caching where appropriate
- **Terms of Service**: Comply with ScraperAPI's terms of service and target websites' policies

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `SCRAPERAPI_KEY` is properly set in your environment
2. **Rate Limiting**: Check your ScraperAPI account limits and upgrade if needed
3. **Country Targeting**: Verify that your desired country/city is supported by ScraperAPI
4. **Rendering Issues**: JavaScript rendering consumes additional credits; use only when necessary

### Debug Information

Enable debug logging to troubleshoot issues:

```typescript
// Check configuration
console.log('ScraperAPI Config:', {
  apiKey: config.apiKey ? '***' : 'missing',
  countryCode: config.countryCode,
  tld: config.tld,
  render: config.render
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Include comprehensive tests for new features
- Update documentation for API changes
- Respect semantic versioning

## Support

For issues related to:
- **ScraperAPI service**: Refer to [ScraperAPI documentation](https://www.scraperapi.com/documentation/)
- **Token Ring integration**: Check the main Token Ring repository
- **Package bugs**: Open an issue in this repository

---

**Version**: 0.1.0  
**License**: MIT  
**Maintainers**: Token Ring AI Team