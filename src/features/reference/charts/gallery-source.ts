/**
 * The code between `// #region id` and `// #endregion` in a family's
 * source, without the markers and with its indentation removed.
 */
export function regionSource(source: string, id: string) {
  const start = source.indexOf(`// #region ${id}\n`)

  if (start < 0) return ""

  const body = source.slice(start + `// #region ${id}\n`.length)
  const end = body.indexOf("// #endregion")

  return (end < 0 ? body : body.slice(0, end)).trimEnd()
}
