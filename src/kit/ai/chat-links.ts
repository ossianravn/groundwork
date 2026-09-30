/**
 * Links that open an outside chat with a question filled in. They carry the
 * question in the URL, so keep personal or private details out of it.
 */
export const chatLinks = {
  claude: (question: string) =>
    `https://claude.ai/new?q=${encodeURIComponent(question)}`,
  chatgpt: (question: string) =>
    `https://chatgpt.com/?q=${encodeURIComponent(question)}`,
}
