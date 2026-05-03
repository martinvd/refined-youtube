const style = document.createElement('style');

style.textContent = `
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer[is-shorts] {
    display: none !important;
  }
`;

document.documentElement.append(style);
