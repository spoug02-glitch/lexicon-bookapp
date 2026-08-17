"use client";

import { useEffect, useState } from "react";
import {
  PROVINCES_SORTED,
  getDistrictsSortedByName,
  type Region,
} from "@/lib/korea-regions";
import { AvailabilityBadge, type AvailabilityStatus } from "./AvailabilityBadge";
import { QuotaBanner } from "@/components/ui/QuotaBanner";

interface Holding {
  libCode: string;
  libName: string;
  address: string;
  hasBook: boolean;
  loanAvailable: boolean;
}

interface HoldingsResponse {
  holdings: Holding[];
  stale: boolean;
  error?: string;
}

function summarize(holdings: Holding[]): { status: AvailabilityStatus; library?: Holding } {
  const available = holdings.find((h) => h.loanAvailable);
  if (available) return { status: "AVAILABLE", library: available };
  const held = holdings.find((h) => h.hasBook);
  if (held) return { status: "ON_LOAN", library: held };
  return { status: "NOT_HELD" };
}

const DEFAULT_PROVINCE = "11"; // 서울

export function LibraryAvailabilityCard({ isbn13 }: { isbn13: string }) {
  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [districts, setDistricts] = useState<Region[]>(() =>
    getDistrictsSortedByName(DEFAULT_PROVINCE),
  );
  const [district, setDistrict] = useState<string>(districts[0]?.code ?? "");
  const [data, setData] = useState<HoldingsResponse | null>(null);
  // 로딩 여부는 별도 state 대신 "마지막으로 응답을 받은 요청 키"와 비교해 렌더 중 계산한다
  // (effect 본문에서 setState를 동기 호출하면 불필요한 리렌더가 한 번 더 발생함).
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const requestKey = `${isbn13}:${province}:${district}`;

  function handleProvinceChange(nextProvince: string) {
    const nextDistricts = getDistrictsSortedByName(nextProvince);
    setProvince(nextProvince);
    setDistricts(nextDistricts);
    setDistrict(nextDistricts[0]?.code ?? "");
  }

  useEffect(() => {
    if (!district) return;
    let cancelled = false;
    fetch(`/api/library/${isbn13}?region=${province}&dtl_region=${district}`)
      .then((res) => res.json())
      .then((json: HoldingsResponse) => {
        if (!cancelled) {
          setData(json);
          setLoadedKey(requestKey);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isbn13, province, district, requestKey]);

  const loading = loadedKey !== requestKey;
  const holdings = data?.holdings ?? [];
  const { status, library } = summarize(holdings);

  return (
    <div className="bg-surface rounded-xl p-stack-md shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-stack-sm gap-2">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[20px]">local_library</span>
          <span className="font-title-lg text-body-lg font-semibold">도서관</span>
        </div>
        <div className="flex gap-1">
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="text-label-md bg-surface-container-high text-on-surface rounded-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="시/도 선택"
          >
            {PROVINCES_SORTED.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="text-label-md bg-surface-container-high text-on-surface rounded-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="구/군 선택"
          >
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant mt-2">조회 중...</p>
      ) : data?.error ? (
        <QuotaBanner provider="library" />
      ) : (
        <div className="flex flex-col gap-1 mt-stack-md">
          <AvailabilityBadge status={status} />
          {library ? (
            <>
              <p className="text-body-md text-on-surface-variant mt-2">{library.libName}</p>
              <p className="text-label-md text-on-surface-variant mt-1">{library.address}</p>
            </>
          ) : (
            <p className="text-body-md text-on-surface-variant mt-2">
              선택한 지역에서 소장한 도서관이 없습니다.
            </p>
          )}
          {data?.stale && (
            <p className="text-label-md text-on-surface-variant/70 mt-1">
              최신 정보가 아닐 수 있어요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
