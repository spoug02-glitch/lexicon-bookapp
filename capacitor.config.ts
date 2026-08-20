import type { CapacitorConfig } from '@capacitor/cli';

// 이 앱은 Next.js 웹앱을 웹뷰로 그대로 감싸는 구조 — 로컬 번들 대신 배포된 서버를 직접 로드한다.
// server.url을 바꾸면 곧 다른 배포(스테이징 등)를 가리키게 되므로, 실제 프로덕션 URL이 아니면
// 여기 값을 함부로 바꾸지 말 것.
const config: CapacitorConfig = {
  appId: 'kr.chaekgyeol.app',
  appName: '책결',
  webDir: 'public',
  server: {
    url: 'https://lexicon-bookapp.vercel.app',
    cleartext: false,
  },
};

export default config;
