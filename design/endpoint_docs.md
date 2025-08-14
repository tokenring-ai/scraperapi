---
description: >-
  Learn to use ScraperAPI's endpoint for web scraping in NodeJS. Configure
  parameters and send GET requests with API keys, enable JS rendering, and set
  geotargeting.
---

# API Endpoint Method

ScraperAPI exposes a single API endpoint for you to send GET requests. Simply send a GET request to `http://api.scraperapi.com` with two query string parameters and the API will return the HTML response for that URL:

* `api_key` which contains your API key, and
* `url` which contains the url you would like to scrape

You should format your requests to the API endpoint as follows:

{% code overflow="wrap" %}
```javascript
import request from 'request-promise';
request('http://api.scraperapi.com/?api_key=API_KEY&url=https://example.com/')
.then(response => {
console.log(response);
})
.catch(error => {
console.log(error);
});
```
{% endcode %}

To enable other API functionality when sending a request to the API endpoint simply add the appropriate query parameters to the end of the ScraperAPI URL.

For example, if you want to enable Javascript rendering with a request, then add `render=true` to the request:

{% code overflow="wrap" %}
```javascript
import fetch from 'node-fetch';
fetch(`http://api.scraperapi.com/?api_key=APIKEY&url=http://httpbin.org/ip&render=true`)
.then(response => {
console.log(response)
})
.catch(error => {
console.log(error)
})
```
{% endcode %}

To use two or more parameters, simply separate them with the “&” sign.

{% code overflow="wrap" %}
```javascript
import fetch from 'node-fetch';
fetch(`http://api.scraperapi.com/?api_key=APIKEY&url=http://httpbin.org/ip&render=true&country_code=us`)
.then(response => {
console.log(response)
})
.catch(error => {
console.log(error)
})
```
{% endcode %}
