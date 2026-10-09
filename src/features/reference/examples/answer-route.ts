import {
  convertToModelMessages,
  streamText,
  tool,
  type LanguageModel,
  type UIMessage,
} from "ai"
import { exampleLibrary as library } from "./answer-example-library"

/**
 * A chat route whose model can answer with components: the system prompt
 * describes the library, and the showAnswer display tool takes an answer
 * as its input. The client draws that input while it streams.
 */
export async function answerRoute(model: LanguageModel, messages: UIMessage[]) {
  const result = streamText({
    model,
    system: [
      "When an answer is better seen than read, call showAnswer with an answer composed from these components.",
      library.describe(),
    ].join("\n\n"),
    messages: await convertToModelMessages(messages),
    tools: {
      showAnswer: tool({
        description: "Show the person an answer built from components.",
        inputSchema: library.toolSchema(),
        execute: async () => ({ shown: true }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
