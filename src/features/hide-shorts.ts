export const DEFAULT_HIDE_SHORTS = true;

const HOME_SHORTS_SELECTOR = `
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer[is-shorts]
`;
const SHORTS_LINK_SELECTOR = 'a[href^="/shorts/"]';
const SEARCH_RESULT_SHELF_SELECTOR = "grid-shelf-view-model";
const HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS = "refined-youtube-hidden-shorts-shelf";

const HIDE_SHORTS_CSS = `
  ${HOME_SHORTS_SELECTOR} {
    display: none !important;
  }

  ${SEARCH_RESULT_SHELF_SELECTOR}.${HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS} {
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }
`;

export function createHideShortsFeature({
  onShortsVisibilityChanged,
}: {
  onShortsVisibilityChanged(): void;
}): {
  setEnabled(enabled: boolean): void;
} {
  const style = document.createElement("style");
  style.textContent = HIDE_SHORTS_CSS;
  document.documentElement.append(style);

  let enabled = DEFAULT_HIDE_SHORTS;
  const pendingShortsRoots = new Set<ParentNode>();
  let shortsFlushScheduled = false;

  function findOutermostGridShelf(element: Element): Element | undefined {
    let outermostShelf: Element | undefined;
    let currentElement: Element | null = element;

    while (currentElement !== null) {
      if (currentElement.matches(SEARCH_RESULT_SHELF_SELECTOR)) {
        outermostShelf = currentElement;
      }

      currentElement = currentElement.parentElement;
    }

    return outermostShelf;
  }

  function markShortsShelves(root: ParentNode): void {
    if (!enabled) {
      return;
    }

    if (root instanceof Element && root.matches(SHORTS_LINK_SELECTOR)) {
      findOutermostGridShelf(root)?.classList.add(HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS);
    }

    const shortsLinks = root.querySelectorAll(SHORTS_LINK_SELECTOR);
    for (let i = 0; i < shortsLinks.length; i += 1) {
      findOutermostGridShelf(shortsLinks[i]!)?.classList.add(
        HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS,
      );
    }
  }

  function scheduleShortsFlush(): void {
    if (!enabled || shortsFlushScheduled) {
      return;
    }

    shortsFlushScheduled = true;
    requestAnimationFrame(() => {
      shortsFlushScheduled = false;
      const roots = [...pendingShortsRoots];
      pendingShortsRoots.clear();

      if (!enabled) {
        return;
      }

      for (const root of roots) {
        markShortsShelves(root);
      }

      onShortsVisibilityChanged();
    });
  }

  function enqueueShortsScan(root: ParentNode): void {
    if (!enabled) {
      return;
    }

    pendingShortsRoots.add(root);
    scheduleShortsFlush();
  }

  function enqueueFromAddedNodes(addedNodes: NodeList): void {
    for (let i = 0; i < addedNodes.length; i += 1) {
      const node = addedNodes[i];
      if (!(node instanceof Element)) {
        continue;
      }

      if (node.matches(SHORTS_LINK_SELECTOR) || node.querySelector(SHORTS_LINK_SELECTOR) !== null) {
        enqueueShortsScan(node);
      }
    }
  }

  const shortsObserver = new MutationObserver((records) => {
    for (const record of records) {
      enqueueFromAddedNodes(record.addedNodes);
    }
  });

  function removeShortsShelfMarkers(): void {
    const hiddenShelves = document.querySelectorAll(
      `${SEARCH_RESULT_SHELF_SELECTOR}.${HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS}`,
    );

    for (let i = 0; i < hiddenShelves.length; i += 1) {
      hiddenShelves[i]!.classList.remove(HIDDEN_SEARCH_RESULT_SHORTS_SHELF_CLASS);
    }
  }

  function setEnabled(nextEnabled: boolean): void {
    enabled = nextEnabled;
    style.textContent = nextEnabled ? HIDE_SHORTS_CSS : "";

    if (!nextEnabled) {
      shortsObserver.disconnect();
      pendingShortsRoots.clear();
      removeShortsShelfMarkers();
      onShortsVisibilityChanged();
      return;
    }

    shortsObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    enqueueShortsScan(document);
  }

  return { setEnabled };
}
