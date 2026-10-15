export default {
  sourceDir: "dist/firefox",
  artifactsDir: "dist",
  build: {
    filename: "refined-youtube-{version}.xpi",
    overwriteDest: true,
  },
  lint: {
    warningsAsErrors: true,
  },
};
