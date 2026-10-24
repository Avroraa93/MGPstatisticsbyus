# APEX GP — MotoGP Race Intelligence

A responsive Next.js starter for an independent MotoGP fan analytics site. It includes a live weather API integration via Open-Meteo, a rider directory UI, a transparent illustrative forecast control, and a Supabase schema for future licensed timing/news integrations.

## What is functional now

- Responsive desktop/mobile dashboard and navigation.
- Circuit selector for six circuits.
- Server-side weather endpoint: `/api/weather?circuit=phillip` (Open-Meteo; cached for 30 minutes).
- Hourly forecast and current air-weather metrics.
- Interactive scenario calculator clearly labelled **illustrative**, not a trained prediction model.
- Rider directory, replay centre and news/health states that explicitly show when feeds are not connected.
- Supabase SQL schema for circuits, riders, sessions, lap times/sectors, race events, public rider updates, weather snapshots and prediction snapshots.

## Not connected yet

Official MotoGP live timing, historical lap/sector feeds, injury/health statements and video streaming. Those need a permitted data provider/API and/or official links/streaming rights. Do not scrape restricted services or republish broadcasts without permission. Do not present demo values as official stats.

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Check production build:

```bash
npm run build
npm start
```

## Publish free with GitHub + Vercel

1. Create a GitHub account at https://github.com/ and a new **private or public** repository named `apex-gp`. Public is optional; the deployed site can be public even if the source repository is private.
2. On your computer, unzip this project. Open the extracted folder. Upload all project files (including `app`, `lib`, `supabase`, `package.json`, and `next.config.mjs`) to the repository using GitHub's **Add file → Upload files**, then commit.
3. Create an account at https://vercel.com/ and choose **Add New → Project**.
4. Import the `apex-gp` GitHub repository. Vercel should detect Next.js automatically. Leave build settings at defaults and deploy.
5. Vercel will provide a public `*.vercel.app` URL with HTTPS. Each push to the connected repository triggers a new deployment.

Vercel Hobby is intended for personal, non-commercial use; check current terms before using it commercially. Free limits can change.

## Add a database (optional for first public preview)

1. Create a free project at https://supabase.com/.
2. In the Supabase project, open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. Copy the project URL and the public/publishable (anon) key from **Project Settings → API**.
4. In Vercel, open the project **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Redeploy after setting environment variables.

The current UI does not yet query Supabase; the schema is the database foundation for the next implementation step. Never put a Supabase `service_role` secret in a `NEXT_PUBLIC_` variable or browser code. Keep write access restricted to trusted server-side jobs.

Supabase Free has resource limits and inactive projects may be paused. Read the current plan terms before relying on it for a production service.

## Data and forecasting integrity

- Weather is fetched from Open-Meteo and describes the atmosphere around the circuit, not measured asphalt temperature. Weather provider attribution is displayed in the UI.
- The displayed win probability is a **demo scenario control**, not a factual forecast. It must be replaced by a validated model trained and tested on historical session data before being presented as a real probability.
- Rider injuries and subjective feelings must be sourced only from public official statements or reputable reporting; every item should include source URL and publication/verification timestamps.
- Live race timing needs a permitted source. Video streams should link to official broadcasters or authorised MotoGP services; do not embed or redistribute a protected broadcast without rights.

## Next development milestones

1. Connect Supabase reads and admin-only writes.
2. Select an authorised source for session results and historical lap/sector data.
3. Build importer and deduplication jobs, with source timestamps and provenance.
4. Build replay from actual lap-position snapshots; label interpolated positions when data is sparse.
5. Add a verified news feed and source/last-checked metadata.
6. Build and validate a probabilistic model using historical data; publish calibration and uncertainty, not just a single number.
7. Add official live video links and timing only where terms allow.

## License note

This repository starter is provided for modification. MotoGP names, team marks, rider photos, race timing and broadcast content may have separate rights. Use licensed assets and follow each data provider's terms.
