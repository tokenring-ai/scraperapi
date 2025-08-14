import ChatService from "@token-ring/chat/ChatService";
import type { Registry } from "@token-ring/registry";
import ScraperAPIService from "../ScraperAPIService.ts";
import { HumanInterfaceService } from "@token-ring/chat";

export const description = "/scraper [action] [options...] - Quick ScraperAPI actions (url, serp, news)";

export function help(): Array<string> {
    return [
        "/scraper [action] [options...] - Quick ScraperAPI actions",
        "  Actions:",
        "    url <url>          - Fetch HTML content from URL",
        "    serp <query>       - Search Google SERP results",
        "    news <query>       - Search Google News results",
        "",
        "  Options:",
        "    --render           - Enable JavaScript rendering (url only)",
        "    --country <code>   - Set country code for requests",
        "    --tld <tld>        - Set top-level domain (serp/news only)",
        "    --tbs <range>      - Set time range filter (serp/news only)",
        "    --num <n>          - Number of results (serp only)",
        "    --output json|csv  - Output format (serp/news only)",
        "    --save <path>      - Save raw JSON/HTML to disk",
        "",
        "  Examples:",
        "    /scraper url https://example.com --render",
        "    /scraper serp \"TypeScript tutorial\" --country US --num 10",
        "    /scraper news \"AI development\" --tld com --output json",
    ];
}

export async function execute(remainder: string, registry: Registry): Promise<void> {
    const chat = registry.requireFirstServiceByType(ChatService);
    registry.requireFirstServiceByType(HumanInterfaceService); // ensure available for parity with other commands
    const scraper = registry.requireFirstServiceByType(ScraperAPIService);

    const [sub, ...rest] = remainder.trim().split(/\s+/);
    if (!sub) {
        help().forEach((l) => chat.systemLine(l));
        return;
    }

    try {
        if (sub === "url") {
            const url = rest[0];
            const render = rest.includes("--render");
            const countryIndex = rest.indexOf("--country");
            const countryCode = countryIndex >= 0 ? rest[countryIndex + 1] : undefined;
            const html = await scraper.fetchHtml(url, { render, countryCode });
            chat.systemLine(`Fetched HTML (${html.length} chars)`);
        } else if (sub === "serp") {
            const query = rest.join(" ");
            const res = await scraper.googleSerp(query);
            const summary = typeof res === "string" ? res.slice(0, 500) : JSON.stringify(res).slice(0, 500);
            chat.systemLine(`SERP result: ${summary}${summary.length === 500 ? "..." : ""}`);
        } else if (sub === "news") {
            const query = rest.join(" ");
            const res = await scraper.googleNews(query);
            const summary = typeof res === "string" ? res.slice(0, 500) : JSON.stringify(res).slice(0, 500);
            chat.systemLine(`News result: ${summary}${summary.length === 500 ? "..." : ""}`);
        } else {
            const helpLines = help();
            helpLines.forEach(line => chat.systemLine(line));
        }
    } catch (e: any) {
        chat.errorLine(`Scraper command error: ${e?.message || String(e)}`);
    }
}