// Markdown negotiation for ldw.build (Vercel Edge Middleware)
// When an AI agent sends `Accept: text/markdown`, serve the page's .md twin.
// Humans (browsers send text/html) keep getting the HTML. Fails OPEN: any error
// or missing twin falls through to the normal HTML response — it can never break a page.
//
// Covers the pages that have a .md twin in the repo (about.md, books.md, consulting.md).
// The HOMEPAGE ("/") is intentionally NOT covered yet — it needs an index.md
// (index.html is mid-edit). Add "/" + "/" : "/index.md" once index.md exists.
//
// ⚠️ Validate on a Vercel PREVIEW before prod:
//   curl -H "Accept: text/markdown" https://<preview-url>/about   → expect Content-Type: text/markdown

export const config = {
  matcher: ['/', '/about', '/books', '/consulting'],
};

const MD_TWIN = {
  '/': '/index.md',
  '/about': '/about.md',
  '/books': '/books.md',
  '/consulting': '/consulting.md',
};

export default async function middleware(request) {
  try {
    const accept = request.headers.get('accept') || '';
    if (!accept.includes('text/markdown')) return; // → normal HTML

    const url = new URL(request.url);
    const target = MD_TWIN[url.pathname];
    if (!target) return;

    url.pathname = target;
    const res = await fetch(new Request(url.toString(), { headers: request.headers }));
    if (!res.ok) return; // twin missing/failed → fall back to HTML

    const headers = new Headers(res.headers);
    headers.set('content-type', 'text/markdown; charset=utf-8');
    headers.set('x-md-negotiated', '1');
    return new Response(res.body, { status: 200, headers });
  } catch (_e) {
    return; // any failure → normal HTML, never break the page
  }
}
