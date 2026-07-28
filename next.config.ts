import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "todo-next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  ...(isGithubPages && {
    output: "export",
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
