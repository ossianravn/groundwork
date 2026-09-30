import { MessageSquare } from "lucide-react"
import { chatLinks } from "@/kit/ai/chat-links"
import { OpenInChat, OpenInChatItem } from "@/kit/ai/open-in-chat"
import { ClaudeIcon } from "@/components/brand-icons"

const question = "Explain how Tandem's project drafts work"

export function OpenInChatExample() {
  return (
    <OpenInChat label="Ask about this page">
      <OpenInChatItem
        icon={<MessageSquare className="size-4" aria-hidden="true" />}
        label="Ask your assistant"
        render={
          <a href={`/app/demo/assistant?q=${encodeURIComponent(question)}`} />
        }
      />
      <OpenInChatItem
        icon={<ClaudeIcon className="size-4" />}
        label="Open in Claude"
        href={chatLinks.claude(question)}
      />
    </OpenInChat>
  )
}
