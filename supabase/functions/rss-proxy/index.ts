// rss-proxy — LDW.BUILD
// Fetches the Substack RSS feed server-side, parses to JSON, returns 6 most recent posts.
// Called by articles.html — avoids CORS restriction on direct browser fetch.

const FEED_URL = 'https://buildwithldw.substack.com/feed';
const MAX_ITEMS = 6;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'ldw.build/rss-proxy' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ items: [], error: 'Feed fetch failed' }), {
        status: 200, headers: CORS,
      });
    }

    const xml = await res.text();

    // Parse <item> blocks from RSS XML
    const items: object[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      if (items.length >= MAX_ITEMS) break;
      const block = match[1];

      const title     = getCDATA(block, 'title')     || getText(block, 'title')     || '';
      const link      = getText(block, 'link')        || getCDATA(block, 'link')     || '';
      const pubDate   = getText(block, 'pubDate')     || '';
      const rawDesc   = getCDATA(block, 'description') || getText(block, 'description') || '';

      // Strip HTML tags and trim to ~200 chars for excerpt
      const excerpt = stripHtml(rawDesc).trim().slice(0, 220).replace(/\s+\S*$/, '') + '…';

      // Category / tag
      const category  = getCDATA(block, 'category')  || getText(block, 'category')  || 'Arise & Build';

      // Format date
      const dateStr = pubDate ? formatDate(pubDate) : '';

      items.push({ title, link, excerpt, category, pubDate: dateStr });
    }

    return new Response(JSON.stringify({ items }), { status: 200, headers: CORS });

  } catch (err) {
    return new Response(JSON.stringify({ items: [], error: String(err) }), {
      status: 200, headers: CORS,
    });
  }
});

// ── helpers ────────────────────────────────────────────────────────────────

function getCDATA(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  return m ? m[1].trim() : '';
}

function getText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ');
}

function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
