// 책결 브랜드 심볼 — 확정된 디자인 레퍼런스(docs/brand/logo-wordmark-reference.png, 5안)에서
// 직접 크롭한 래스터 이미지. 벡터로 재현하려던 이전 시도들이 레퍼런스와 어긋나 보인다는
// 피드백을 받아, 레퍼런스 이미지 자체를 그대로 사용하는 방식으로 바꿨다.
interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-mark-light.png"
      width={size}
      height={size}
      className={className}
      alt="책결 심볼"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
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
