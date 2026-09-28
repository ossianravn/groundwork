import { useState } from "react"
import { Button } from "@/kit/ui/button"
import { Card } from "@/kit/ui/card"
import { MemberAvatar } from "@/kit/member-avatar"
import {
  MemberDialog,
  type MemberAction,
} from "@/features/settings/member-dialog"
import { useWorkspace } from "@/demo/use-workspace"

export function StateTeam() {
  const demo = useWorkspace()
  const [action, setAction] = useState<MemberAction | null>(null)
  const [feedback, setFeedback] = useState("")
  const [ownedIds] = useState(() =>
    demo.projects
      .filter((project) => project.ownerId === "leo")
      .map((project) => project.id),
  )
  const member = demo.workspace.members.find((person) => person.id === "leo")
  const membership = demo.memberships.find(
    (person) => person.memberId === "leo",
  )

  return (
    <Card className="state-team">
      <h3 id="team-search" tabIndex={-1}>
        Team member
      </h3>
      {member && membership?.active ? (
        <div className="state-member-row">
          <MemberAvatar member={member} />
          <div>
            <strong>{member.name}</strong>
            <p>{membership.email}</p>
          </div>
          <Button
            id="team-action-leo"
            variant="outline"
            onClick={() =>
              setAction({
                kind: "remove",
                member: {
                  ...member,
                  email: membership.email,
                  role: membership.role,
                },
              })
            }
          >
            Remove member
          </Button>
        </div>
      ) : (
        <p>Leo Chen is no longer a member of Studio North.</p>
      )}
      <h4>Project ownership</h4>
      <ul className="state-ownership">
        {demo.projects
          .filter((project) => ownedIds.includes(project.id))
          .map((project) => (
            <li key={project.id}>
              <span>{project.name}</span>
              <span>
                {
                  demo.workspace.members.find(
                    (person) => person.id === project.ownerId,
                  )?.name
                }
              </span>
            </li>
          ))}
      </ul>
      <p role="status" className="state-feedback">
        {feedback}
      </p>
      {action && (
        <MemberDialog
          action={action}
          members={demo.workspace.members}
          projectCount={ownedIds.length}
          onClose={() => setAction(null)}
          onChange={(id, change) => {
            const result = demo.updateMember(id, change)
            if (result.ok)
              setFeedback("Member removed. Project ownership updated.")
            return result
          }}
        />
      )}
    </Card>
  )
}
