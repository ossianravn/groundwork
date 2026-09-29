import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { importFields, type ColumnMapping } from "@/demo/project-import"

const skip = "skip"

/** Match each project field to a column; the first row shows an example. */
export function ImportMapping({
  headers,
  example,
  mapping,
  onChange,
}: {
  headers: string[]
  example: string[]
  mapping: ColumnMapping
  onChange: (mapping: ColumnMapping) => void
}) {
  const items = [
    { value: skip, label: "Don’t import" },
    ...headers.map((header, index) => ({
      value: String(index),
      label: header || `Column ${index + 1}`,
    })),
  ]

  return (
    <dl className="import-mapping">
      {importFields.map((field) => {
        const index = mapping[field.key]
        const id = `import-map-${field.key}`

        return (
          <div key={field.key}>
            <dt>
              <label htmlFor={id}>
                {field.label}
                {field.required && (
                  <span className="text-muted-foreground"> (required)</span>
                )}
              </label>
            </dt>
            <dd>
              <Select
                items={items}
                value={index === null ? skip : String(index)}
                onValueChange={(value) =>
                  onChange({
                    ...mapping,
                    [field.key]:
                      !value || value === skip ? null : Number(value),
                  })
                }
              >
                <SelectTrigger id={id} className="import-mapping-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="import-example">
                {index === null
                  ? "Left empty"
                  : example[index]
                    ? `e.g. ${example[index]}`
                    : "Empty in the first row"}
              </span>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
