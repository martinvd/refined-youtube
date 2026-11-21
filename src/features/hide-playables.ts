export const DEFAULT_HIDE_PLAYABLES = true;

const HIDE_PLAYABLES_CSS = `
  ytd-rich-section-renderer:has(ytd-mini-game-card-view-model),
  ytd-rich-shelf-renderer:has(ytd-mini-game-card-view-model),
  ytd-rich-item-renderer:has(ytd-mini-game-card-view-model) {
    display: none !important;
  }
`;

export function createHidePlayablesFeature(): {
  setEnabled(enabled: boolean): void;
} {
  const style = document.createElement("style");
  document.documentElement.append(style);

  function setEnabled(enabled: boolean): void {
    style.textContent = enabled ? HIDE_PLAYABLES_CSS : "";
  }

  return { setEnabled };
}
