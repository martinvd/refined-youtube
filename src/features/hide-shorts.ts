export const DEFAULT_HIDE_SHORTS = true;

const HIDE_SHORTS_CSS = `
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer[is-shorts] {
    display: none !important;
  }
`;

export function createHideShortsFeature({ onShortsHidden }: { onShortsHidden(): void }): {
  setEnabled(enabled: boolean): void;
} {
  const style = document.createElement("style");
  style.textContent = HIDE_SHORTS_CSS;
  document.documentElement.append(style);

  function setEnabled(enabled: boolean): void {
    style.textContent = enabled ? HIDE_SHORTS_CSS : "";

    if (enabled) {
      onShortsHidden();
    }
  }

  return { setEnabled };
}
