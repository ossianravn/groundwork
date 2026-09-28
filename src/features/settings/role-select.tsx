import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { roleLabels, teamRoles, type TeamRole } from "@/demo/team"

export function RoleSelect({
  id,
  value,
  onChange,
  includeOwner = true,
}: {
  id: string
  value: TeamRole
  onChange: (value: TeamRole) => void
  includeOwner?: boolean
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger id={id} className="team-role-select">
        <SelectValue>{roleLabels[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {teamRoles
            .filter((role) => includeOwner || role !== "owner")
            .map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabels[role]}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
