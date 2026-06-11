# portfolio-analytics

Cloudflare Worker that logs client events from cameronaziz.com to a D1 database. This is the sink the front-end `track()` helper in `src/analytics.ts` posts to.

## Endpoint

Live at `https://analytics.cameronaziz.com` (Workers custom domain, Cloudflare manages TLS and DNS).

| Method | Path | Purpose |
| --- | --- | --- |
| OPTIONS | `*` | CORS preflight |
| GET | `/` or `/health` | health check |
| POST | `/event` (any path) | ingest one event |
| GET | `/events` | read recent events (admin) |

### Ingest

POST a JSON body shaped like the front-end payload:

```json
{
  "event": "chat_message_sent",
  "distinctId": "uuid",
  "properties": { "path": "/chat", "ts": "2026-06-11T23:25:00Z", "session_id": "..." }
}
```

The Worker stores the full `properties` blob as JSON and also lifts `session_id`, `path`, and `ts` into their own columns for easy querying. It adds server-side context (`referer`, `user_agent`, `country` from CF-IPCountry, and `received_at`) and returns 204. CORS allows `cameronaziz.com`, its subdomains, and the local dev ports.

### Read (admin)

Guarded by the `ADMIN_TOKEN` secret.

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://analytics.cameronaziz.com/events?limit=50"
curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://analytics.cameronaziz.com/events?event=chat_message_sent"
```

## Storage

D1 database `portfolio-analytics` (id `a10425bc-9ff6-4286-a58f-3d4b789eea96`), table `analytics_events`. See `schema.sql`.

## Deploy

```bash
npm install
wrangler secret put ADMIN_TOKEN   # one time
npm run schema                    # one time, applies schema.sql to the remote D1
npm run deploy
```

## Ad hoc queries

```bash
wrangler d1 execute portfolio-analytics --remote \
  --command "SELECT event, COUNT(*) n FROM analytics_events GROUP BY event ORDER BY n DESC"
```
