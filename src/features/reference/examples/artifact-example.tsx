import { useState } from "react"
import { Check, Copy, Send } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Artifact,
  ArtifactActions,
  ArtifactContent,
  ArtifactFooter,
  ArtifactHeader,
} from "@/kit/ai/artifact"
import { MessageAction } from "@/kit/ai/message-actions"
import { MessageResponse } from "@/kit/ai/message-response"

const draft = `## Mobile app: week of 18 – 24 Sept

**In review**, due 30 Sept. 36 of 40 tasks done (90%).

### Next

- Final review with Ava
- App Store submission`

export function ArtifactExample() {
  const [posted, setPosted] = useState(false)

  return (
    <Artifact className="max-w-xl">
      <ArtifactHeader
        title="Status update: Mobile app"
        description={posted ? "Posted to Mobile app" : "Draft"}
      >
        <ArtifactActions>
          <MessageAction label="Copy markdown">
            <Copy aria-hidden="true" />
          </MessageAction>
          {!posted && (
            <Button variant="outline" size="sm" onClick={() => setPosted(true)}>
              <Send data-icon="inline-start" aria-hidden="true" />
              Post to project
            </Button>
          )}
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent>
        <MessageResponse>{draft}</MessageResponse>
      </ArtifactContent>
      {posted && (
        <ArtifactFooter>
          <Check className="size-3.5" aria-hidden="true" />
          Posted to Mobile app as a comment.
        </ArtifactFooter>
      )}
    </Artifact>
  )
}
