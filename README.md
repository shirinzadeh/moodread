# Mood Reads

**Mood Reads** (also branded as *Moodread* in the app) is a [Nuxt 3](https://nuxt.com/) web application that helps you explore books through **mood**, **search**, and **personalized recommendations**. It uses the Google Books API for discovery, [Supabase](https://supabase.com/) for authentication and data, and server-side logic to score suggestions from your saved books and search history.

## What the project does

- **Mood-based exploration**: Choose a mood to see books you have already saved under that mood (requires an account).
- **Book search**: Query the Google Books API with debounced search and rich result cards.
- **Save books**: Authenticated users can save titles to their library in Supabase; saving triggers **automatic mood tagging** using text analysis (title, authors, description, categories).
- **Recommendations**: For signed-in users, the app builds keyword signals from saved books and search history, fetches candidates from Google Books, and **scores** them (keywords, ratings, recency) to surface a “Recommended for You” carousel.
- **Feedback**: Users can submit mood-related feedback tied to books to improve the experience over time.

The UI is built with **Nuxt UI**, **Tailwind CSS**, **Swiper**, and **Nuxt Image** (with a Netlify image provider configuration in production builds).

## Why it is useful

Reading choices are often emotional as well as practical. Mood Reads connects **how you feel** with **what you read**, keeps your library and searches in one place, and uses your own activity—not only manual filters—to suggest the next book. Developers can also use it as a reference for Nuxt 3 SSR patterns, Supabase auth, server API routes (Nitro), and third-party API integration.

## Getting started

### Prerequisites

- **Node.js** (LTS recommended) and a package manager (`npm`, `pnpm`, `yarn`, or `bun`)
- A **Supabase** project with Auth enabled and tables that match what the app expects (for example `moods`, `books`, `search_history`, `mood_feedback`, and related user records—see `types/database.types.ts` for generated types)
- Books are loaded from the **Google Books API** (the client uses the public volumes endpoint; ensure your usage fits Google’s quotas and terms)

### Configuration

Create a `.env` file in the project root with your Supabase credentials (the app reads these via Nuxt config):

- `SUPABASE_URL` — your Supabase project URL  
- `SUPABASE_KEY` — your Supabase anon (public) key  

Never commit real secrets; keep `.env` out of version control.

### Install and run

```bash
# Install dependencies
npm install
# or: pnpm install | yarn install | bun install

# Start the development server (default: http://localhost:3000)
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

For deployment details, see the [Nuxt deployment guide](https://nuxt.com/docs/getting-started/deployment).

### Linting

```bash
npm run lint
npm run lint:fix
```

## Where to get help

- **Issues and bugs**: Open an issue on the [GitHub repository](https://github.com/shirinzadeh/moodread/issues) with steps to reproduce and your environment (Node version, Nuxt version, browser).
- **Framework documentation**: [Nuxt 3 docs](https://nuxt.com/docs/getting-started/introduction), [Supabase + Nuxt](https://supabase.com/docs/guides/getting-started/quickstarts/nuxtjs), [Nuxt UI](https://ui.nuxt.com/).

## Maintainers and contributors

The project is maintained by **[shirinzadeh](https://github.com/shirinzadeh)** ([repository](https://github.com/shirinzadeh/moodread)). Contributions are welcome: fork the repo, open a pull request with a clear description of the change, and link any related issue. For larger changes, opening an issue first helps align on direction.

---

Additional references: [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction)
