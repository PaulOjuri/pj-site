// The bindings every agent-app endpoint uses. Set with `wrangler pages secret put <NAME>` (see README).
export interface AppEnv {
  /** Same D1 database as the step-4 event log, so the feed can show agent events next to pushed items. */
  AGENTS_DB: D1Database

  /** Bearer token for /api/agent/*. Separate from AGENTS_INGEST_TOKEN on purpose. */
  AGENT_APP_TOKEN: string

  /** VAPID keys for Web Push. Generate with `node scripts/vapid-keys.mjs`. */
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string

  /** Fine-grained PAT, read+write issues on PaulOjuri/agent-network only. */
  GITHUB_INBOX_TOKEN: string
  /** Defaults to PaulOjuri/agent-network. */
  INBOX_REPO?: string
  /**
   * The GitHub API to talk to. Defaults to https://api.github.com and is only ever set in local tests,
   * which point it at a stub (tests/app/github-stub.mjs) so the decide flow can be driven without a PAT.
   */
  GITHUB_API_BASE?: string

  /** Cloudflare Access: "<team>.cloudflareaccess.com" (or just "<team>") and the application's AUD tag. */
  ACCESS_TEAM_DOMAIN: string
  ACCESS_AUD: string
  /** Optional second gate: the Access identity must carry this email. */
  APP_OWNER_EMAIL?: string
  /**
   * Local development only. `wrangler pages dev` sits in front of nothing, so there is no Access JWT to
   * check; set this to "1" in .dev.vars (git-ignored) to work on the app locally. It is ignored unless
   * ACCESS_TEAM_DOMAIN is empty, so a deployed site with Access configured can never be opened by it.
   */
  APP_ACCESS_DEV_BYPASS?: string
}
