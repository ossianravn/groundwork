import { CodeBlock } from "@/kit/ui/code-block"
import { exampleLibrary } from "./answer-example-library"
import routeSource from "./answer-route?raw"

const schema = JSON.stringify(exampleLibrary.toolInputSchema(), null, 2)

// Scrolls inside a bounded height instead of running down the page.
const bounded = "max-h-96 [&_[data-slot=code-block-body]]:min-h-0"

/** How the example connects to a model, and what the model receives. */
export function AnswerGuide() {
  return (
    <section
      className="reference-prose grid gap-3"
      aria-labelledby="answer-model"
    >
      <h2 id="answer-model">Connect a model</h2>
      <p>
        A model answers with components by calling a display tool whose input is
        the answer. This route describes the library in the system prompt and
        gives the tool the library&apos;s schema; the AI SDK streams the
        call&apos;s input to the client, where <code>AnswerRenderer</code> draws
        it as in the preview.
      </p>
      <CodeBlock code={routeSource} language="ts" filename="answer-route.ts" />
      <p>
        On the client, draw each <code>tool-showAnswer</code> part with{" "}
        <code>AnswerRenderer</code>: pass <code>part.input?.nodes</code>, and{" "}
        <code>streaming</code> while <code>part.state</code> is{" "}
        <code>input-streaming</code>. Keep each answer&apos;s state by its{" "}
        <code>toolCallId</code> and send it with the next request; send an
        action as the person&apos;s next message. <code>toolSchema()</code>{" "}
        reads the finished input leniently, as the renderer does, so call{" "}
        <code>library.validate()</code> to log what a model got wrong. For a
        provider&apos;s own API, <code>toolInputSchema()</code> gives the plain
        JSON Schema.
      </p>
      <details className="reference-source-details">
        <summary>Tool input schema</summary>
        <CodeBlock
          className={bounded}
          code={schema}
          language="json"
          filename="library.toolInputSchema()"
        />
      </details>
      <details className="reference-source-details">
        <summary>Prompt description</summary>
        <CodeBlock
          className={bounded}
          code={exampleLibrary.describe()}
          filename="library.describe()"
        />
      </details>
    </section>
  )
}
