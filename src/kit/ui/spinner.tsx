import { LoaderCircle } from "lucide-react"
import { cn } from "cn"

// Adapted from shadcn's base-nova spinner with a fixed Lucide icon.
function Spinner({
  className,
  label = "Loading",
  ...props
}: React.ComponentProps<"svg"> & { label?: string }) {
  return (
    <LoaderCircle
      data-slot="spinner"
      role="status"
      aria-label={label}
      className={cn(
        "size-4 animate-spin motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

export { Spinner }
