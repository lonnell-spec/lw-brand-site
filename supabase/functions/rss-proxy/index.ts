// rss-proxy v2 — LDW.BUILD
// Returns 6 most recent Substack posts as JSON.
// Extracts cover image from RSS (enclosure > media:content > first img in content).
// Falls back to category-mapped placeholder image when no cover image exists.
// Category is detected from title + excerpt keywords.

const FEED_URL  = 'https://buildwithldw.substack.com/feed';
const MAX_ITEMS = 6;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

// ── Category image map ──────────────────────────────────────────────────────
// Curated Unsplash photos that match the brand aesthetic (dark, editorial, warm).
// Replace any value with your own Supabase Storage URL when brand images are ready.
const CATEGORY_IMAGES: Record<string, string> = {
  leadership:     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  systems:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  faith:          'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
  infrastructure: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  data:           'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  speaking:       'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  ministry:       'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80',
  building:       'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
  default:        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
};

// ── Keyword → category map ──────────────────────────────────────────────────
const KEYWORD_CATEGORIES: Array<[string[], string]> = [
  [['lead','leader','leadership','manage','execut','director','pastor','EP'],          'leadership'],
  [['system','process','workflow','operat','infrastructure','architect','build'],       'systems'],
  [['faith','spirit','holy','god','jesus','scripture','bible','pray','worship'],       'faith'],
  [['infrastructure','scale','structure','framework','foundation','stack'],            'infrastructure'],
  [['data','metric','analytics','dashboard','insight','report','track','measure'],     'data'],
  [['speak','stage','conferen','keynote','talk','present','audience'],                 'speaking'],
  [['church','ministry','congregation','mission','preach','sermon','plant'],           'ministry'],
  [['build','construct','start','launch','create','found','grow','arise'],             'building'],
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'ldw.build/rss-proxy-v2' },
    });

    if (!res.ok) {
      return json({ items: [], error: 'Feed fetch failed' });
    }

    const xml   = await res.text();
    const items = parseItems(xml);

    return json({ items });

  } catch (err) {
    return json({ items: [], error: String(err) });
  }
});

// ── Parser ──────────────────────────────────────────────────────────────────

function parseItems(xml: string): object[] {
  const results: object[] = [];
  const itemBlocks = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemBlocks) {
    if (results.length >= MAX_ITEMS) break;
    const block = match[1];

    const title    = getCDATA(block, 'title')    || getText(block, 'title')    || '';
    const link     = getText(block, 'link')       || getCDATA(block, 'link')   || '';
    const pubDate  = getText(block, 'pubDate')    || '';
    const category = getCDATA(block, 'category') || getText(block, 'category') || '';
    const rawDesc  = getCDATA(block, 'description') || getText(block, 'description') || '';
    const content  = getCDATA(block, 'content:encoded') || '';

    const excerpt = stripHtml(rawDesc).trim().replace(/\s+/g, ' ').slice(0, 210).replace(/\s+\S*$/, '') + '…';

    // ── Image resolution: cover > enclosure > media:content > first img in content ──
    const image = extractImage(block, content, title, excerpt, category);

    results.push({
      title,
      link,
      excerpt,
      category: category || detectCategory(title + ' ' + excerpt),
      pubDate:  formatDate(pubDate),
      image,
    });
  }

  return results;
}

function extractImage(block: string, content: string, title: string, excerpt: string, category: string): string {
  // 1. Enclosure tag (Substack uses this for cover images)
  const enc = block.match(/<enclosure[^>]+url="([^"]+)"[^>]*>/i);
  if (enc && isImage(enc[1])) return enc[1];

  // 2. media:content
  const media = block.match(/<media:content[^>]+url="([^"]+)"[^>]*>/i);
  if (media && isImage(media[1])) return media[1];

  // 3. First <img src="..."> in content:encoded
  if (content) {
    const img = content.match(/<img[^>]+src="([^"]+)"/i);
    if (img && isImage(img[1])) return img[1];
  }

  // 4. Category fallback — detect category from text, return mapped image
  const cat = detectCategory(title + ' ' + excerpt + ' ' + category);
  return CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES.default;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keywords, cat] of KEYWORD_CATEGORIES) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'default';
}

function isImage(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url) || url.includes('substackcdn') || url.includes('unsplash');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCDATA(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  return m ? m[1].trim() : '';
}

function getText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s{2,}/g, ' ');
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function json(data: object): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: CORS_HEADERS });
}
