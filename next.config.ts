import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로젝트 루트에 이미 사용자 지정 CLAUDE.md가 있어 Next.js가 자동 생성하는
  // AGENTS.md/CLAUDE.md와 충돌할 수 있으므로 비활성화한다.
  agentRules: false,
  // 발췌 공유 카드(next/og) 렌더링이 런타임에 fs로 직접 읽는 폰트 파일 —
  // output file tracing이 정적 분석으로 못 찾을 수 있어 명시적으로 포함시킨다.
  outputFileTracingIncludes: {
    "/api/share-card/**": ["./src/fonts/Pretendard-*.otf"],
    "/share/[reviewId]": ["./src/fonts/Pretendard-*.otf"],
  },
};

export default nextConfig;
