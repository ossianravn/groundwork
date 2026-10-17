import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

// Adapted from shadcn's base-nova slider. The range input inside each thumb
// is the control assistive technology reads, so the slider's name and
// description go to every thumb, and getAriaValueText can say the value in
// words ("12 members"). An array value makes a range, one thumb per value.
function Slider<Value extends number | readonly number[]>({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  getAriaValueText,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: SliderPrimitive.Root.Props<Value> & {
  getAriaValueText?: SliderPrimitive.Thumb.Props["getAriaValueText"]
}) {
  const current = value ?? defaultValue
  const thumbs = Array.isArray(current) ? current.length : 1

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex min-h-(--control-height-sm) w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbs }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            index={thumbs > 1 ? index : undefined}
            data-slot="slider-thumb"
            aria-label={label}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            getAriaValueText={getAriaValueText}
            className="relative block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] duration-(--motion-fast) select-none after:absolute after:-inset-2 hover:ring-3 has-focus-visible:ring-3 data-dragging:ring-3 data-disabled:pointer-events-none"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
