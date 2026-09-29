import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type RefObject,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

interface CarouselState {
  viewport: RefObject<HTMLDivElement | null>
  canPrevious: boolean
  canNext: boolean
  scrollBy: (direction: -1 | 1) => void
}

const CarouselContext = createContext<CarouselState | null>(null)

function useCarousel() {
  const state = useContext(CarouselContext)

  if (!state) throw new Error("Carousel parts must be inside <Carousel>")

  return state
}

// A carousel on native scroll snapping (KIT-11): swipe, trackpad and
// keyboard scrolling work without a library, and Previous/Next move by one
// visible page. Slides are announced as "slide" within a named carousel.
function Carousel({
  label,
  className,
  children,
  ...props
}: ComponentProps<"section"> & { label: string }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ canPrevious: false, canNext: false })

  const measure = useCallback(() => {
    const element = viewport.current

    if (!element) return

    setEdges({
      canPrevious: element.scrollLeft > 1,
      canNext:
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    const element = viewport.current

    if (!element) return

    const observer = new ResizeObserver(measure)

    observer.observe(element)
    element.addEventListener("scroll", measure, { passive: true })

    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", measure)
    }
  }, [measure])

  const scrollBy = (direction: -1 | 1) => {
    const element = viewport.current
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

    element?.scrollBy({
      left: direction * element.clientWidth * 0.9,
      behavior: reduce ? "auto" : "smooth",
    })
  }

  return (
    <CarouselContext value={{ viewport, scrollBy, ...edges }}>
      <section
        data-slot="carousel"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn("grid grid-cols-[minmax(0,1fr)] gap-4", className)}
        {...props}
      >
        {children}
      </section>
    </CarouselContext>
  )
}

function CarouselContent({ className, ...props }: ComponentProps<"ul">) {
  const { viewport } = useCarousel()

  return (
    <div
      ref={viewport}
      data-slot="carousel-viewport"
      className="relative -mx-1 min-w-0 scroll-px-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul
        data-slot="carousel-content"
        className={cn("flex gap-(--carousel-gap,1rem)", className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({
  className,
  index,
  count,
  ...props
}: ComponentProps<"li"> & { index: number; count: number }) {
  return (
    <li
      data-slot="carousel-item"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-(--carousel-item,85%) snap-start",
        className,
      )}
      {...props}
    />
  )
}

function CarouselButton({
  direction,
  className,
  ...props
}: ComponentProps<typeof Button> & { direction: -1 | 1 }) {
  const { canPrevious, canNext, scrollBy } = useCarousel()

  return (
    <Button
      variant="outline"
      size="icon"
      data-slot={direction < 0 ? "carousel-previous" : "carousel-next"}
      aria-label={direction < 0 ? "Previous slides" : "Next slides"}
      disabled={direction < 0 ? !canPrevious : !canNext}
      focusableWhenDisabled
      className={cn("rounded-full", className)}
      onClick={() => scrollBy(direction)}
      {...props}
    >
      {direction < 0 ? (
        <ChevronLeft aria-hidden="true" />
      ) : (
        <ChevronRight aria-hidden="true" />
      )}
    </Button>
  )
}

function CarouselPrevious(props: ComponentProps<typeof Button>) {
  return <CarouselButton direction={-1} {...props} />
}

function CarouselNext(props: ComponentProps<typeof Button>) {
  return <CarouselButton direction={1} {...props} />
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
