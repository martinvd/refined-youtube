import { DEFAULT_HIDE_SHORTS, createHideShortsFeature } from "./features/hide-shorts.ts";

const hideShortsFeature = createHideShortsFeature();

function getStoredBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

void chrome.storage.sync.get({ hideShorts: DEFAULT_HIDE_SHORTS }).then((stored) => {
  hideShortsFeature.setEnabled(getStoredBoolean(stored.hideShorts, DEFAULT_HIDE_SHORTS));
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  if ("hideShorts" in changes) {
    hideShortsFeature.setEnabled(
      getStoredBoolean(changes.hideShorts?.newValue, DEFAULT_HIDE_SHORTS),
    );
  }
});
