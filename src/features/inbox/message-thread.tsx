import { MemberAvatar } from "@/kit/member-avatar"
import { Bubble, BubbleContent } from "@/kit/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/kit/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/kit/ui/message-scroller"
import { formatDate, type Member } from "@/demo/model"
import type { InboxPost } from "@/demo/inbox"

export function MessageThread({
  posts,
  members,
  currentUserId,
}: {
  posts: InboxPost[]
  members: Member[]
  currentUserId: string
}) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="inbox-thread" aria-label="Conversation">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {posts.map((post) => {
              const member = members.find((item) => item.id === post.memberId)
              const own = post.memberId === currentUserId

              return (
                <MessageScrollerItem key={post.id} messageId={post.id}>
                  <Message className="inbox-post">
                    <MessageAvatar>
                      <MemberAvatar
                        member={
                          member ?? {
                            id: post.memberId,
                            name: "Former member",
                            initials: "?",
                          }
                        }
                      />
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>
                        <strong>
                          {own ? "You" : (member?.name ?? "Former member")}
                        </strong>
                        <time dateTime={post.date}>
                          {formatDate(post.date.slice(0, 10))}
                          {post.date.includes("T") &&
                            `, ${new Date(post.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
                        </time>
                      </MessageHeader>
                      <Bubble variant="ghost">
                        <BubbleContent>
                          <p>{post.body}</p>
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )
            })}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
