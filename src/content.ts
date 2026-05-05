import {
  DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
  createCollapseHiddenElementsFeature,
} from './features/collapse-hidden-elements.ts';
import {
  DEFAULT_HIDE_SHORTS,
  createHideShortsFeature,
} from './features/hide-shorts.ts';

const collapseHiddenElements = createCollapseHiddenElementsFeature();
const hideShortsFeature = createHideShortsFeature({
  onShortsHidden: () => collapseHiddenElements.enqueue(document),
});

function getStoredBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

void chrome.storage.sync
  .get({
    hideShorts: DEFAULT_HIDE_SHORTS,
    collapseHiddenElements: DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
  })
  .then((stored) => {
    const shouldHideShorts = getStoredBoolean(
      stored.hideShorts,
      DEFAULT_HIDE_SHORTS,
    );
    const shouldCollapseHiddenElements = getStoredBoolean(
      stored.collapseHiddenElements,
      DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
    );

    collapseHiddenElements.setEnabled(shouldCollapseHiddenElements);
    hideShortsFeature.setEnabled(shouldHideShorts);
  });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }

  if ('hideShorts' in changes) {
    hideShortsFeature.setEnabled(
      getStoredBoolean(changes.hideShorts?.newValue, DEFAULT_HIDE_SHORTS),
    );
  }

  if ('collapseHiddenElements' in changes) {
    collapseHiddenElements.setEnabled(
      getStoredBoolean(
        changes.collapseHiddenElements?.newValue,
        DEFAULT_COLLAPSE_HIDDEN_ELEMENTS,
      ),
    );
  }
});
