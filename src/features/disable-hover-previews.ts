export const DEFAULT_DISABLE_HOVER_PREVIEWS = true;

// The inline player YouTube floats over a thumbnail while it is hovered
const PREVIEW_PLAYER_SELECTOR = "ytd-video-preview, #inline-preview-player";

const DISABLE_HOVER_PREVIEWS_CSS = `
  ytd-video-preview,
  ytd-thumbnail-overlay-loading-preview-renderer {
    display: none !important;
  }
`;

// Hiding the preview isn't enough: it would keep streaming in the background
function pausePreview(event: Event): void {
  const target = event.target;

  if (target instanceof HTMLVideoElement && target.closest(PREVIEW_PLAYER_SELECTOR)) {
    target.pause();
  }
}

export function createDisableHoverPreviewsFeature(): {
  setEnabled(enabled: boolean): void;
} {
  const style = document.createElement("style");
  document.documentElement.append(style);

  function setEnabled(enabled: boolean): void {
    style.textContent = enabled ? DISABLE_HOVER_PREVIEWS_CSS : "";

    // `play` doesn't bubble, so listen in the capture phase
    if (enabled) {
      document.addEventListener("play", pausePreview, true);
    } else {
      document.removeEventListener("play", pausePreview, true);
    }
  }

  return { setEnabled };
}
