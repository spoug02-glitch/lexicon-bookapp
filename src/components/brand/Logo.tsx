import { LOGO_DOT, LOGO_FOLDED_PAGE_PATH, LOGO_GRAIN_LINES, LOGO_SPINE_PATH } from "./logo-paths";

// 책결 브랜드 심볼 — 접힌 페이지(세이지그린) + 책의 결(딥네이비 가로선) + 점(p.)으로 구성된 "P" 형태.
// 확정된 디자인 레퍼런스(5안: 접힌 페이지로 만든 p 심볼 + 워드마크)를 벡터로 재현한 것.
interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="책결 심볼"
    >
      {/* 책등(P의 기둥) */}
      <path d={LOGO_SPINE_PATH} fill="var(--color-primary)" />
      {/* 책의 결 — 페이지가 살짝 펼쳐진 가로선 3개 */}
      {LOGO_GRAIN_LINES.map((d) => (
        <path key={d} d={d} stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {/* 접힌 페이지 — P의 볼(bowl), 세이지그린 */}
      <path d={LOGO_FOLDED_PAGE_PATH} fill="var(--color-brand-sage)" />
      {/* p.의 점 */}
      <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="var(--color-primary)" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
}

// 가로형 조합 마크: 심볼 + "p.책결" 워드마크 (+선택적 태그라인)
export function Logo({ size = 32, showTagline = false, className }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <div className="flex flex-col leading-none">
        <span className="flex items-baseline gap-0.5">
          <span className="font-bold" style={{ color: "var(--color-brand-sage)", fontSize: size * 0.5 }}>
            p.
          </span>
          <span className="font-bold" style={{ color: "var(--color-primary)", fontSize: size * 0.6 }}>
            책결
          </span>
        </span>
        {showTagline && (
          <span className="text-label-md text-on-surface-variant mt-0.5">
            읽다, 남기다, 연결되다
          </span>
        )}
      </div>
    </div>
  );
}
