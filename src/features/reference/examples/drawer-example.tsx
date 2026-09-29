import { useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/kit/ui/drawer"
import { RadioGroup, RadioGroupItem } from "@/kit/ui/radio-group"
import { Label } from "@/kit/ui/label"

const sorts = ["Due date", "Progress", "Name"]

export function DrawerExample() {
  const [sort, setSort] = useState(sorts[0])

  return (
    <div className="grid justify-items-start gap-2">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>
          Sort: {sort}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sort projects</DrawerTitle>
            <DrawerDescription>
              Swipe down or press Escape to close.
            </DrawerDescription>
          </DrawerHeader>
          <RadioGroup
            value={sort}
            onValueChange={(value) => setSort(String(value))}
            className="p-4"
            aria-label="Sort by"
          >
            {sorts.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <RadioGroupItem value={item} id={`drawer-sort-${item}`} />
                <Label htmlFor={`drawer-sort-${item}`}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
