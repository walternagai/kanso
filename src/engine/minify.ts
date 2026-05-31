export interface MinifyOptions {
  removeComments?: boolean;
  collapseWhitespace?: boolean;
  removeRedundantAttributes?: boolean;
}

const DEFAULT_OPTIONS: MinifyOptions = {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
};

export function minifyHtml(
  html: string,
  options: MinifyOptions = DEFAULT_OPTIONS
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = html;

  if (opts.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }

  if (opts.collapseWhitespace) {
    result = result.replace(/\s+/g, " ");
    result = result.replace(/>\s+</g, "><");
    result = result.replace(/\s+>/g, ">");
    result = result.replace(/<\s+/g, "<");
  }

  if (opts.removeRedundantAttributes) {
    result = result.replace(
      /<script[^>]*type="text\/javascript"[^>]*>/g,
      (match) => match.replace(/\s*type="text\/javascript"/, "")
    );
    result = result.replace(
      /<style[^>]*type="text\/css"[^>]*>/g,
      (match) => match.replace(/\s*type="text\/css"/, "")
    );
  }

  return result.trim();
}
