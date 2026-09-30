import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/kit/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/kit/ui/popover"

export interface ModelOption {
  id: string
  name: string
  description: string
}

/**
 * Chooses the model for the next message. A quiet button names the current
 * model; its list describes each one. Past a handful of models the list
 * gains a search field.
 */
function ModelSelector({
  models,
  value,
  onValueChange,
  className,
}: {
  models: ModelOption[]
  value: string
  onValueChange: (id: string) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const current = models.find((model) => model.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full text-muted-foreground hover:text-foreground",
              className,
            )}
            aria-label={`Model: ${current?.name ?? "none"}`}
          />
        }
      >
        {current?.name ?? "Model"}
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <Command value={value} label="Models">
          {models.length > 6 && <CommandInput placeholder="Search models" />}
          <CommandList>
            <CommandEmpty>No model matches.</CommandEmpty>
            {models.map((model) => (
              <CommandItem
                key={model.id}
                value={model.id}
                keywords={[model.name]}
                onSelect={() => {
                  onValueChange(model.id)
                  setOpen(false)
                }}
                className="items-start py-2 [&>svg:last-child]:hidden"
              >
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </span>
                <Check
                  className={cn(
                    "mt-0.5 size-4",
                    model.id === value ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
                {model.id === value && (
                  <span className="sr-only">, selected</span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { ModelSelector }
