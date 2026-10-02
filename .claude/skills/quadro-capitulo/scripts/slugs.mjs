// Slugs do capítulo N na ordem do roteiro, separados por vírgula. Uso: node .claude/skills/quadro-capitulo/scripts/slugs.mjs 7
import fs from "node:fs";
const n = process.argv[2] ?? "7";
const s = fs.readFileSync(`src/lib/capitulo${n}/roteiro.ts`, "utf8");
console.log([...s.matchAll(/slug: "(c\d+p\d+)", n: (\d+)/g)].sort((a, b) => +a[2] - +b[2]).map((m) => m[1]).join(","));
