import CleanCSS from "clean-css";
import { minify } from "terser";

export async function minifyJavaScript(source, label = "app.js") {
  const result = await minify(source, {
    compress: {
      passes: 2
    },
    mangle: true,
    safari10: true,
    format: {
      comments: false
    }
  });

  if (!result.code) {
    throw new Error(`Could not minify ${label}.`);
  }

  return `${result.code}\n`;
}

export function minifyCss(source, label = "styles.css") {
  const result = new CleanCSS({
    level: 1,
    rebase: false,
    returnPromise: false
  }).minify(source);

  if (result.errors.length) {
    throw new Error(`Could not minify ${label}: ${result.errors.join("; ")}`);
  }

  return `${result.styles}\n`;
}
