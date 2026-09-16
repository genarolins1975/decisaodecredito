import "server-only";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

let purifier: ReturnType<typeof createDOMPurify> | null = null;
function purify() {
  if (!purifier) {
    purifier = createDOMPurify(new JSDOM("").window as any);
  }
  return purifier;
}

/** Sanitiza HTML editável pelo professor: sem script, iframe, formulários, eventos ou links externos de script. */
export function sanitizeHtml(html: string): string {
  return purify().sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
    ADD_ATTR: ["data-latex", "aria-label", "role", "viewBox", "aria-hidden", "scope", "colspan", "rowspan", "target"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "style", "link", "meta", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "srcdoc"],
  }) as unknown as string;
}
