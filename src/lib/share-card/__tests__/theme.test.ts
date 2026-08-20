import { describe, expect, it } from "vitest";
import { getShareCardTheme, getShareCardRatio, SHARE_CARD_THEMES, SHARE_CARD_RATIOS } from "../theme";

describe("getShareCardTheme", () => {
  it("존재하는 id는 해당 테마를 반환한다", () => {
    expect(getShareCardTheme("navy").id).toBe("navy");
  });

  it("존재하지 않거나 없는 id는 첫 번째(기본) 테마로 폴백한다", () => {
    expect(getShareCardTheme("no-such-theme").id).toBe(SHARE_CARD_THEMES[0].id);
    expect(getShareCardTheme(null).id).toBe(SHARE_CARD_THEMES[0].id);
    expect(getShareCardTheme(undefined).id).toBe(SHARE_CARD_THEMES[0].id);
  });
});

describe("getShareCardRatio", () => {
  it("존재하는 id는 해당 비율을 반환한다", () => {
    expect(getShareCardRatio("portrait")).toEqual(SHARE_CARD_RATIOS[1]);
  });

  it("존재하지 않는 id는 첫 번째(기본) 비율로 폴백한다", () => {
    expect(getShareCardRatio("no-such-ratio")).toEqual(SHARE_CARD_RATIOS[0]);
  });
});
