import { loadAndExtractThread } from "./extract";
import type { ExtractMessage, ExtractResponse } from "./types";

// 이미 주입된 경우 리스너 중복 등록 방지
if (!(window as Record<string, unknown>).__threadArchiveInjected) {
  (window as Record<string, unknown>).__threadArchiveInjected = true;

  chrome.runtime.onMessage.addListener(
    (message: ExtractMessage, sender, sendResponse: (r: ExtractResponse) => void) => {
      if (message.type !== "EXTRACT_THREAD") return false;

      const tabId = sender.tab?.id;

      loadAndExtractThread((loaded) => {
        if (tabId !== undefined) {
          chrome.runtime.sendMessage({ type: "LOAD_PROGRESS", loaded }).catch(() => {});
        }
      }).then((thread) => {
        if (!thread) {
          sendResponse({ ok: false, error: "스레드를 찾을 수 없습니다. Twitter/X 스레드 페이지인지 확인해 주세요." });
        } else {
          sendResponse({ ok: true, thread });
        }
      }).catch((e: unknown) => {
        sendResponse({ ok: false, error: String(e) });
      });

      return true;
    },
  );
}
