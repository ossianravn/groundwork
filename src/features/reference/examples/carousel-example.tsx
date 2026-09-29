import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/kit/ui/carousel"

const milestones = [
  "Discovery",
  "Concepts",
  "Identity",
  "Typography",
  "Guidelines",
  "Launch",
]

export function CarouselExample() {
  return (
    <Carousel label="Project milestones" className="max-w-xl">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Brand refresh milestones</p>
        <div className="flex gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent className="[--carousel-gap:0.75rem]">
        {milestones.map((name, index) => (
          <CarouselItem
            key={name}
            index={index}
            count={milestones.length}
            className="basis-40"
          >
            <div className="grid h-28 content-end rounded-lg border bg-card p-3 text-sm">
              <span className="text-muted-foreground">Step {index + 1}</span>
              <span className="font-medium">{name}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
