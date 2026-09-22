import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  poweredByHeader: false,
  serverExternalPackages: ["@node-rs/argon2", "pg"],
  // a aula em slides é lida do disco pela rota /slides/aula-2; sem isto a Vercel não o empacota
  outputFileTracingIncludes: {
    "/slides/aula-2": ["./content/slides/**"], "/professor/aovivo/[id]": ["./content/slides/**"],
    "/aulas": ["./content/slides/**"], "/aulas/aula-2": ["./content/slides/**"], "/aulas/aula-2/slide/[n]": ["./content/slides/**"],
    "/aulas/capitulo/[n]": ["./content/slides/**"], "/professor/conteudo": ["./content/slides/**"], "/inicio": ["./content/slides/**"],
    "/api/materiais/aula-2/[arquivo]": ["./content/materiais/**"],
  },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
