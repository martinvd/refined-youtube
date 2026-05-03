const HIDE_SHORTS_CSS = `
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer[is-shorts] {
    display: none !important;
  }
`;

const style = document.createElement('style');
style.textContent = HIDE_SHORTS_CSS;
document.documentElement.append(style);

function setHideShorts(enabled: boolean): void {
  style.textContent = enabled ? HIDE_SHORTS_CSS : '';
}

void chrome.storage.sync.get({ hideShorts: true }).then((stored) => {
  const hideShorts =
    typeof stored.hideShorts === 'boolean' ? stored.hideShorts : true;
  setHideShorts(hideShorts);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync' || !('hideShorts' in changes)) {
    return;
  }

  const next = changes.hideShorts?.newValue;
  setHideShorts(typeof next === 'boolean' ? next : true);
});
