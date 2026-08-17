import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로젝트 루트에 이미 사용자 지정 CLAUDE.md가 있어 Next.js가 자동 생성하는
  // AGENTS.md/CLAUDE.md와 충돌할 수 있으므로 비활성화한다.
  agentRules: false,
};

export default nextConfig;
