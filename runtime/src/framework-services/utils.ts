/**
 * Extracts YAML frontmatter from a markdown file.
 * Returns the raw YAML string between the first pair of "---" delimiters, or null
 * if no frontmatter block is found.
 */
export function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}
