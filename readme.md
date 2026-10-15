# refined-youtube

> Browser extension that refines the YouTube experience

Features:

- [x] Option to hide YouTube Shorts
- [x] Option to stop videos playing when hovering thumbnails

Tested on Chrome and Firefox.

## Install

Download [latest release](https://github.com/martinvd/refined-youtube/releases/latest), or build from source.

The `.zip` is for Chrome. The `.xpi` is an unsigned build for Firefox Developer Edition or Nightly.

## Development

```bash
bun install
bun dev # or bun run build
```

`bun run build` writes `dist/chrome` and `dist/firefox`.

Load `dist/chrome` as an unpacked extension in Chrome.

In Firefox, open `about:debugging`, choose This Firefox, choose Load Temporary Add-on, and select `dist/firefox/manifest.json`.

After a build, `bun run package:chrome` writes the Chrome `.zip` to `dist`. `bun run package:firefox` lints the Firefox build and writes the `.xpi` to `dist`.
