import nextConfig from "eslint-config-next";
export default [
  ...nextConfig,
  { ignores: [
    "content/generated/**", ".next/**", "drizzle/**", "scripts/legacy/**",
    "playwright-report/**", "test-results/**",
    "aula_credito_html/app/vendor/**", "aula_credito_html/dist/**", "content/slides/**",
  ] },
];
