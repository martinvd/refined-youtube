const HIDE_SHORTS_CSS = `
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer[is-shorts] {
    display: none !important;
  }
`;

const DEFAULT_HIDE_SHORTS = true;
const DEFAULT_COLLAPSE_HIDDEN_ELEMENTS = true;

const style = document.createElement('style');
style.textContent = HIDE_SHORTS_CSS;
document.documentElement.append(style);

let collapseHiddenElements = DEFAULT_COLLAPSE_HIDDEN_ELEMENTS;

function getStoredBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function setHideShorts(enabled: boolean): void {
  style.textContent = enabled ? HIDE_SHORTS_CSS : '';

  if (enabled && collapseHiddenElements) {
    enqueueHideEmptyRichSections(document);
  }
}

void chrome.storage.sync
  .get({
    hideShorts: DEFAULT_HIDE_SHORTS,
    collapseHiddenElements: DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
  })
  .then((stored) => {
    const hideShorts = getStoredBoolean(stored.hideShorts, DEFAULT_HIDE_SHORTS);
    const shouldCollapseHiddenElements = getStoredBoolean(
      stored.collapseHiddenElements,
      DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
    );

    setCollapseHiddenElements(shouldCollapseHiddenElements);
    setHideShorts(hideShorts);
  });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }

  if ('hideShorts' in changes) {
    setHideShorts(
      getStoredBoolean(changes.hideShorts?.newValue, DEFAULT_HIDE_SHORTS),
    );
  }

  if ('collapseHiddenElements' in changes) {
    setCollapseHiddenElements(
      getStoredBoolean(
        changes.collapseHiddenElements?.newValue,
        DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
      ),
    );
  }
});

// -----------------------------------------------------------------------------
// Empty rich sections: hide hosts that have no layout box (not the same as
// Shorts CSS). Generic DOM helper + observer; keep separate from Shorts code.
// -----------------------------------------------------------------------------

const RICH_SECTION_SELECTOR = 'ytd-rich-section-renderer';
const HIDDEN_EMPTY_RICH_SECTION_CLASS =
  'refined-youtube-hidden-empty-section';

const emptyRichSectionStyle = document.createElement('style');
emptyRichSectionStyle.textContent = `
  ${RICH_SECTION_SELECTOR}.${HIDDEN_EMPTY_RICH_SECTION_CLASS} {
    display: none !important;
  }
`;
document.documentElement.append(emptyRichSectionStyle);

function applyEmptyRichSectionVisibility(element: Element): void {
  if (!collapseHiddenElements) {
    return;
  }

  if (!element.matches(RICH_SECTION_SELECTOR)) {
    return;
  }

  element.classList.remove(HIDDEN_EMPTY_RICH_SECTION_CLASS);

  const content = element.querySelector(':scope > #content');
  if (!(content instanceof Element)) {
    return;
  }

  const contentBox = content.getBoundingClientRect();
  const hasRenderedContent = contentBox.width > 0 && contentBox.height > 0;
  element.classList.toggle(
    HIDDEN_EMPTY_RICH_SECTION_CLASS,
    !hasRenderedContent,
  );
}

/** Marks empty `ytd-rich-section-renderer` hosts under `root` (cheap layout read). */
function hideEmptyRichSections(root: ParentNode): void {
  if (!collapseHiddenElements) {
    return;
  }

  if (root instanceof Element && root.matches(RICH_SECTION_SELECTOR)) {
    applyEmptyRichSectionVisibility(root);
  }

  const sections = root.querySelectorAll(RICH_SECTION_SELECTOR);
  for (let i = 0; i < sections.length; i += 1) {
    applyEmptyRichSectionVisibility(sections[i]!);
  }
}

const pendingEmptyRichSectionRoots = new Set<ParentNode>();
let emptyRichSectionFlushScheduled = false;

function scheduleFlushEmptyRichSections(): void {
  if (!collapseHiddenElements) {
    return;
  }

  if (emptyRichSectionFlushScheduled) {
    return;
  }

  emptyRichSectionFlushScheduled = true;
  requestAnimationFrame(() => {
    emptyRichSectionFlushScheduled = false;
    const roots = [...pendingEmptyRichSectionRoots];
    pendingEmptyRichSectionRoots.clear();

    if (!collapseHiddenElements) {
      return;
    }

    for (const root of roots) {
      hideEmptyRichSections(root);
    }
  });
}

function enqueueHideEmptyRichSections(root: ParentNode): void {
  if (!collapseHiddenElements) {
    return;
  }

  pendingEmptyRichSectionRoots.add(root);
  scheduleFlushEmptyRichSections();
}

function enqueueFromAddedNodes(addedNodes: NodeList): void {
  for (let i = 0; i < addedNodes.length; i += 1) {
    const node = addedNodes[i];
    if (!(node instanceof Element)) {
      continue;
    }

    const sectionHost = node.matches(RICH_SECTION_SELECTOR)
      ? node
      : node.closest(RICH_SECTION_SELECTOR);

    if (sectionHost) {
      enqueueHideEmptyRichSections(sectionHost);
      continue;
    }

    if (node.querySelector(RICH_SECTION_SELECTOR) !== null) {
      enqueueHideEmptyRichSections(node);
    }
  }
}

const emptyRichSectionObserver = new MutationObserver((records) => {
  for (const record of records) {
    enqueueFromAddedNodes(record.addedNodes);
  }
});

function removeEmptyRichSectionMarkers(): void {
  const hiddenSections = document.querySelectorAll(
    `${RICH_SECTION_SELECTOR}.${HIDDEN_EMPTY_RICH_SECTION_CLASS}`,
  );

  for (let i = 0; i < hiddenSections.length; i += 1) {
    hiddenSections[i]!.classList.remove(HIDDEN_EMPTY_RICH_SECTION_CLASS);
  }
}

function setCollapseHiddenElements(enabled: boolean): void {
  collapseHiddenElements = enabled;

  if (!enabled) {
    emptyRichSectionObserver.disconnect();
    pendingEmptyRichSectionRoots.clear();
    removeEmptyRichSectionMarkers();
    return;
  }

  emptyRichSectionObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  enqueueHideEmptyRichSections(document);
}
