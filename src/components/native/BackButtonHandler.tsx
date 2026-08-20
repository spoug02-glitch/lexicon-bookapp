"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

// Capacitor의 BridgeActivity 기본 back 처리(webView.canGoBack())가 Android 15+(targetSdk 36)의
// 예측형 뒤로가기 제스처와 맞물려 웹뷰 히스토리를 건너뛰고 액티비티를 바로 종료시키는 문제가
// 있어(매니페스트에서 enableOnBackInvokedCallback=false로도 완전히 막히지 않는 기기가 있음),
// 이 리스너로 뒤로가기를 직접 처리한다: 히스토리가 있으면 이동, 없으면 홈으로 보낸다(앱 강제
// 종료 대신 백그라운드로 최소화하는 게 표준 Android 동작이라 여기선 앱을 끝내지 않는다).
export function BackButtonHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return null;
}
