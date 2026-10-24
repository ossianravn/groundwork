export interface Sentence {
  text: string
  /** Where the sentence starts in the whole text. */
  start: number
}

/** Splits text into sentences, keeping where each starts. */
export function sentences(text: string): Sentence[] {
  return [...text.matchAll(/[^.!?…]+(?:[.!?…]+["')\]]*|$)/gu)].flatMap(
    (match) => {
      const lead = match[0].length - match[0].trimStart().length
      const sentence = match[0].trim()

      return sentence ? { text: sentence, start: match.index + lead } : []
    },
  )
}

/**
 * The sentence being spoken at `position`, with the position inside it, so
 * captions show one sentence at a time rather than the whole reply.
 */
export function sentenceAt(text: string, position: number) {
  const list = sentences(text)
  const reached = list.filter((sentence) => sentence.start < position)
  const current = reached.at(-1) ?? list[0]

  return current
    ? { text: current.text, position: position - current.start }
    : { text: "", position: 0 }
}
