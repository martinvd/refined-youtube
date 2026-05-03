const hideShortsCheckbox = document.getElementById('hide-shorts');

if (!(hideShortsCheckbox instanceof HTMLInputElement)) {
  throw new Error('Expected #hide-shorts to be an HTMLInputElement');
}

void chrome.storage.sync.get({ hideShorts: true }).then((stored) => {
  const hideShorts =
    typeof stored.hideShorts === 'boolean' ? stored.hideShorts : true;
  hideShortsCheckbox.checked = hideShorts;
});

hideShortsCheckbox.addEventListener('change', () => {
  void chrome.storage.sync.set({ hideShorts: hideShortsCheckbox.checked });
});
