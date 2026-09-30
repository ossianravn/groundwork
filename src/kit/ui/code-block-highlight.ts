import type { HighlighterCore, ThemedToken } from "shiki/core"

/**
 * Languages the code block highlights. Each loads on first use; anything else
 * renders as plain text. Add a language by adding its shiki import here.
 */
const languages = {
  bash: () => import("shiki/langs/bash.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
}

export type CodeLanguage = keyof typeof languages

const aliases = new Map<string, CodeLanguage>([
  ["sh", "bash"],
  ["shell", "bash"],
  ["shellscript", "bash"],
  ["zsh", "bash"],
  ["js", "javascript"],
  ["jsx", "tsx"],
  ["ts", "typescript"],
])

function isCodeLanguage(name: string): name is CodeLanguage {
  return Object.hasOwn(languages, name)
}

export function codeLanguage(name: string | undefined) {
  const key = name?.toLowerCase() ?? ""

  return isCodeLanguage(key) ? key : aliases.get(key)
}

let highlighter: Promise<HighlighterCore> | undefined

const loaded = new Set<CodeLanguage>()

function createHighlighter() {
  highlighter ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
  ]).then(([core, engine]) =>
    core.createHighlighterCore({
      // Colours come from the kit's --syntax-* tokens, so code follows the
      // theme, the accent and dark mode without a second stylesheet.
      themes: [
        core.createCssVariablesTheme({
          name: "groundwork",
          variablePrefix: "--syntax-",
        }),
      ],
      langs: [],
      engine: engine.createJavaScriptRegexEngine(),
    }),
  )

  return highlighter
}

/** Tokenizes code, or returns undefined when the language is not supported. */
export async function highlightCode(
  code: string,
  language: string | undefined,
): Promise<ThemedToken[][] | undefined> {
  const lang = codeLanguage(language)

  if (!lang) return undefined

  const instance = await createHighlighter()

  if (!loaded.has(lang)) {
    await instance.loadLanguage((await languages[lang]()).default)
    loaded.add(lang)
  }

  return instance.codeToTokensBase(code, { lang, theme: "groundwork" })
}
