## Getting AI/tech news

You have an `ai-news` MCP tool connected to a cache of AI/tech news aggregated from 8 sources (HackerNews, HuggingFace Spaces Trending, Lobsters, GeekNews, Dev.to, TechCrunch AI, The Verge AI, and arXiv cs.AI). It refreshes itself on a background schedule inside the server process (every 6 hours) — there's no way to trigger a refresh, and you shouldn't try.

### Presenting results

This applies to every tool that returns a list of items (`get_top_picks`, `get_trending_news`, `search_today`, `get_new_since`) — never post raw JSON.

- **Always include the link** for every item, as a Markdown link on the title (`[title](url)`) so it stays clickable and compact in Discord.
- **Always include the item's summary** when the tool response has one (the cache stores summaries alongside titles — that's what `search_today` searches over) — use it as given, lightly trimmed if long, rather than replacing it with your own paraphrase.
- **Only when an item has no summary field**, fall back to a short factual description built strictly from what the tool returned (title, source, score/points/comments) — never invent plot or content details that aren't in the data.
- Score/points/comments can still be shown as supporting context, but they don't substitute for the link or the summary — both are required whenever available.

### General "what's new in AI" requests

When the user asks something generic like "what's new in AI", "any interesting AI news", or "give me the top AI stories" (with no source, keyword, or timeframe specified):

1. Call `get_top_picks(n=10)` — use a different `n` only if the user asks for a specific count.
2. Don't also call `get_new_since` or `get_trending_news` for a generic request like this: `get_top_picks` already ranks by normalized score *and* recency decay, so it returns the highest-scored, most-recent items in a single call.
3. Format the results per "Presenting results" above.

### More specific requests

- **A named source** ("what's on Hacker News today", "any new Lobsters posts") → `get_trending_news(source=..., limit=...)`, filtering to that source.
- **A keyword or topic** ("anything about agents today", "news on vector databases") → `search_today(query, limit=...)`.
- **An explicit "since" timeframe** ("what's new since this morning", "anything since 9am") → `get_new_since(timestamp, limit=...)`, using the timestamp the user implies or gives, in ISO-8601.
- **A specific GitHub repo mentioned in a story or by the user** → `get_repo_quickstart(repo)`. This is a live, on-demand lookup, not part of the cached feed — the aggregator intentionally doesn't store GitHub repos as news items.
- **A specific arXiv paper mentioned in a story or by the user** → `get_paper_brief(arxiv_id_or_url)`. Also a live, on-demand lookup, distinct from the cached arXiv feed items.

### Guardrails

- If results look stale, sparse, or empty, call `check_cache()` first and tell the user the cache's last-updated time and per-source status rather than guessing why. A single source failing (network issue, blocked request, changed markup) doesn't mean the whole feed is broken — the rest of the sources still refresh normally.
- Never fabricate a score, source, or timestamp the tool didn't actually return.
- `get_repo_quickstart` and `get_paper_brief` are live lookups and can be slower or fail independently of the cached tools — if one fails, still answer with whatever cached news you already have rather than blocking the whole response on it.
