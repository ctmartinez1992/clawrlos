# Graph Report - clawrlos  (2026-09-17)

## Corpus Check
- Corpus is ~5,537 words - fits in a single context window. You may not need a graph.

## Summary
- 92 nodes · 125 edges · 16 communities (5 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.92)
- Token cost: 98,928 input · 0 output

## Community Hubs (Navigation)
- Deploy Architecture Overview
- AI News MCP Tools
- Links Feature Agent Tools
- Migration Safety & Conventions
- DB Migration Project Config
- Repo Safety Check Script

## God Nodes (most connected - your core abstractions)
1. `README.md (nanobot links store overview)` - 13 edges
2. `CLAUDE.md (project instructions)` - 11 edges
3. `nanobot/DEPLOY.md (links feature wiring)` - 10 edges
4. `dokku/DEPLOY.md (Postgres via Dokku)` - 9 edges
5. `nanobot (HKUDS/nanobot Discord bot)` - 6 edges
6. `Verify Repo Safety Reference` - 5 edges
7. `db/README.md (schema migrations)` - 5 edges
8. `clawrlos-ops-mcp (AI/tech news aggregator)` - 5 edges
9. `Migration immutability convention` - 5 edges
10. `@microsoft/postgres-mcp (postgres MCP tool)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `dokku/DEPLOY.md (Postgres via Dokku)` --conceptually_related_to--> `dokku-postgres plugin`  [INFERRED]
  dokku/DEPLOY.md → CLAUDE.md
- `Verify Repo Safety Skill` --references--> `CLAUDE.md (project instructions)`  [EXTRACTED]
  .claude/skills/verify-repo-safety/SKILL.md → CLAUDE.md
- `Secret-leak incident (real DSN committed to DEPLOY.md)` --references--> `dokku/DEPLOY.md (Postgres via Dokku)`  [EXTRACTED]
  .claude/skills/verify-repo-safety/reference.md → dokku/DEPLOY.md
- `Hetzner server` --references--> `nanobot (HKUDS/nanobot Discord bot)`  [EXTRACTED]
  CLAUDE.md → README.md
- `ai-news-mcp-snippet.json` --references--> `clawrlos-ops-mcp (AI/tech news aggregator)`  [EXTRACTED]
  nanobot/DEPLOY-ai-news.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Links feature deploy pieces (snippet + agent instructions + deploy doc + service)** — nanobot_deploy, nanobot_deploy_mcp_server_snippet, nanobot_agents_links_section, dokku_deploy_nanobot_links_service [EXTRACTED 1.00]
- **AI-news feature deploy pieces (snippet + agent instructions + deploy doc)** — nanobot_deploy_ai_news, nanobot_deploy_ai_news_ai_news_mcp_snippet, nanobot_agents_ai_news_section [EXTRACTED 1.00]
- **Repo safety verification system (migration immutability + secret scan)** — claude_md_migration_immutability_rule, claude_skills_verify_repo_safety_skill_check_script, claude_skills_verify_repo_safety_reference_secret_leak_incident [INFERRED 0.85]

## Communities (16 total, 11 thin omitted)

### Community 0 - "Deploy Architecture Overview"
Cohesion: 0.23
Nodes (16): CLAUDE.md (project instructions), dokku-postgres plugin, Secret-leak incident (real DSN committed to DEPLOY.md), db/README.md (schema migrations), pgweb (read-only table viewer), PGWEB_READONLY setting, dokku/DEPLOY.md (Postgres via Dokku), Container-IP connection workaround (+8 more)

### Community 1 - "AI News MCP Tools"
Cohesion: 0.21
Nodes (11): check_cache tool (guardrail), get_new_since tool, get_paper_brief tool, get_repo_quickstart tool, get_top_picks tool, get_trending_news tool, search_today tool, AGENTS.md (agent workspace instructions) (+3 more)

### Community 2 - "Links Feature Agent Tools"
Cohesion: 0.26
Nodes (11): invoice_items table, link_visits table, links table, message tool (Discord attachment sender), postgres_mcp_connect tool, postgres_mcp_modify tool, postgres_mcp_query tool, visit_photos table (+3 more)

### Community 3 - "Migration Safety & Conventions"
Cohesion: 0.29
Nodes (10): 1758200000000_add-photo-path-to-link-visits.js migration, 1758300000000_create-visit-photos.js migration, Migration immutability convention, Verify Repo Safety Reference, Verify Repo Safety Skill, check.sh (migration + secret scan script), node-pg-migrate, nanobot-links-viewer Dokku app (+2 more)

### Community 4 - "DB Migration Project Config"
Cohesion: 0.25
Nodes (7): dependencies, node-pg-migrate, pg, name, private, node-pg-migrate, pg

## Knowledge Gaps
- **15 isolated node(s):** `check.sh script`, `name`, `private`, `node-pg-migrate`, `node-pg-migrate` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 38 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CLAUDE.md (project instructions)` connect `Deploy Architecture Overview` to `Links Feature Agent Tools`, `Migration Safety & Conventions`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `README.md (nanobot links store overview)` connect `Deploy Architecture Overview` to `AI News MCP Tools`, `Links Feature Agent Tools`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `nanobot/DEPLOY.md (links feature wiring)` connect `Deploy Architecture Overview` to `AI News MCP Tools`, `Links Feature Agent Tools`, `Migration Safety & Conventions`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `check.sh script`, `name`, `private` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._