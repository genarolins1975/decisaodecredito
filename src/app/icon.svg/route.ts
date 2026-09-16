export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#00205B"/><path d="M14 44 L26 28 L36 36 L50 18" fill="none" stroke="#C9A84C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="18" r="4" fill="#C9A84C"/></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
}
