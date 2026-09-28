import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverDescription,
} from "./popover"

/** Short supplementary definitions; required instructions stay visible. */
export function TextHint({
  children,
  description,
}: {
  children: string
  description: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        className="text-hint"
        openOnHover
        delay={300}
        aria-label={`About ${children}`}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="text-hint-content"
        aria-label={children}
      >
        <PopoverDescription>{description}</PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
