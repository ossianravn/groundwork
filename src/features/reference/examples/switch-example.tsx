import { Switch } from "@/kit/ui/switch"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/kit/ui/field"

export function SwitchExample() {
  return (
    <FieldGroup className="max-w-sm">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="digest">Weekly digest</FieldLabel>
          <FieldDescription>
            A Monday summary of your projects.
          </FieldDescription>
        </FieldContent>
        <Switch id="digest" defaultChecked />
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="mentions">Mention alerts</FieldLabel>
          <FieldDescription>
            Notify me when someone mentions me.
          </FieldDescription>
        </FieldContent>
        <Switch id="mentions" />
      </Field>
    </FieldGroup>
  )
}
