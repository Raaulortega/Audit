/** Splits content into lines, normalizing CRLF so line numbers match editors. */
export function splitLines(content: string): string[] {
  return content.replace(/\r\n?/g, '\n').split('\n');
}

/** Returns the 1-indexed line of the first line matching `pattern`, or undefined. */
export function findLine(lines: string[], pattern: RegExp): number | undefined {
  const index = lines.findIndex((line) => pattern.test(line));
  return index === -1 ? undefined : index + 1;
}
