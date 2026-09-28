import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/kit/ui/select"
import workspace from "@/demo/data/workspace.json"

export function SelectExample() {
  const owners = workspace.members.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  return (
    <Field className="w-full max-w-56">
      <FieldLabel htmlFor="example-owner">Owner</FieldLabel>
      <Select defaultValue="ava" items={owners}>
        <SelectTrigger id="example-owner">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {owners.map((owner) => (
              <SelectItem key={owner.value} value={owner.value}>
                {owner.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
