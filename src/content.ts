import {
  DEFAULT_DISABLE_HOVER_PREVIEWS,
  createDisableHoverPreviewsFeature,
} from "./features/disable-hover-previews.ts";
import { DEFAULT_HIDE_SHORTS, createHideShortsFeature } from "./features/hide-shorts.ts";

const features = {
  hideShorts: { feature: createHideShortsFeature(), fallback: DEFAULT_HIDE_SHORTS },
  disableHoverPreviews: {
    feature: createDisableHoverPreviewsFeature(),
    fallback: DEFAULT_DISABLE_HOVER_PREVIEWS,
  },
};

const defaults = Object.fromEntries(
  Object.entries(features).map(([key, { fallback }]) => [key, fallback]),
);

function getStoredBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

void chrome.storage.sync.get(defaults).then((stored) => {
  for (const [key, { feature, fallback }] of Object.entries(features)) {
    feature.setEnabled(getStoredBoolean(stored[key], fallback));
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  for (const [key, { feature, fallback }] of Object.entries(features)) {
    if (key in changes) {
      feature.setEnabled(getStoredBoolean(changes[key]?.newValue, fallback));
    }
  }
});
