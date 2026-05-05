export const DEFAULT_COLLAPSE_HIDDEN_ELEMENTS = true;

const RICH_SECTION_SELECTOR = 'ytd-rich-section-renderer';
const HIDDEN_EMPTY_RICH_SECTION_CLASS =
  'refined-youtube-hidden-empty-section';

export function createCollapseHiddenElementsFeature(): {
  enqueue(root: ParentNode): void;
  setEnabled(enabled: boolean): void;
} {
  let enabled = DEFAULT_COLLAPSE_HIDDEN_ELEMENTS;
  const pendingEmptyRichSectionRoots = new Set<ParentNode>();
  let emptyRichSectionFlushScheduled = false;

  const emptyRichSectionStyle = document.createElement('style');
  emptyRichSectionStyle.textContent = `
    ${RICH_SECTION_SELECTOR}.${HIDDEN_EMPTY_RICH_SECTION_CLASS} {
      display: none !important;
    }
  `;
  document.documentElement.append(emptyRichSectionStyle);

  function applyEmptyRichSectionVisibility(element: Element): void {
    if (!enabled) {
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
    if (!enabled) {
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

  function scheduleFlushEmptyRichSections(): void {
    if (!enabled) {
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

      if (!enabled) {
        return;
      }

      for (const root of roots) {
        hideEmptyRichSections(root);
      }
    });
  }

  function enqueueHideEmptyRichSections(root: ParentNode): void {
    if (!enabled) {
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

  function setEnabled(nextEnabled: boolean): void {
    enabled = nextEnabled;

    if (!nextEnabled) {
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

  return {
    enqueue: enqueueHideEmptyRichSections,
    setEnabled,
  };
}
