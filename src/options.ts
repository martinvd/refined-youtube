const hideShortsCheckbox = document.getElementById("hide-shorts");
const collapseHiddenElementsCheckbox = document.getElementById("collapse-hidden-elements");

if (!(hideShortsCheckbox instanceof HTMLInputElement)) {
  throw new Error("Expected #hide-shorts to be an HTMLInputElement");
}

if (!(collapseHiddenElementsCheckbox instanceof HTMLInputElement)) {
  throw new Error("Expected #collapse-hidden-elements to be an HTMLInputElement");
}

void chrome.storage.sync.get({ hideShorts: true, collapseHiddenElements: true }).then((stored) => {
  const hideShorts = typeof stored.hideShorts === "boolean" ? stored.hideShorts : true;
  const collapseHiddenElements =
    typeof stored.collapseHiddenElements === "boolean" ? stored.collapseHiddenElements : true;

  hideShortsCheckbox.checked = hideShorts;
  collapseHiddenElementsCheckbox.checked = collapseHiddenElements;
});

hideShortsCheckbox.addEventListener("change", () => {
  void chrome.storage.sync.set({ hideShorts: hideShortsCheckbox.checked });
});

collapseHiddenElementsCheckbox.addEventListener("change", () => {
  void chrome.storage.sync.set({
    collapseHiddenElements: collapseHiddenElementsCheckbox.checked,
  });
});
