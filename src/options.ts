const defaults: Record<string, boolean> = {
  hideShorts: true,
  disableHoverPreviews: true,
};

const checkboxes = Object.keys(defaults).map((key) => {
  const checkbox = document.querySelector(`input[name="${key}"]`);

  if (!(checkbox instanceof HTMLInputElement)) {
    throw new Error(`Expected input[name="${key}"] to be an HTMLInputElement`);
  }

  return checkbox;
});

void chrome.storage.sync.get(defaults).then((stored) => {
  for (const checkbox of checkboxes) {
    const value = stored[checkbox.name];
    checkbox.checked = typeof value === "boolean" ? value : defaults[checkbox.name]!;
  }

  requestAnimationFrame(() => {
    document.body.dataset.ready = "";
  });
});

for (const checkbox of checkboxes) {
  checkbox.addEventListener("change", () => {
    void chrome.storage.sync.set({ [checkbox.name]: checkbox.checked });
  });
}
