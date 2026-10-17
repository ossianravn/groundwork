import { useState } from "react"
import { Slider } from "@/kit/ui/slider"

const memberPrice = 12

const members = (count: number) =>
  `${count} ${count === 1 ? "member" : "members"}`

export function SliderExample() {
  const [team, setTeam] = useState(10)

  return (
    <div className="grid w-full max-w-xs gap-2 text-sm">
      <p className="flex justify-between gap-2 font-medium tabular-nums">
        <span id="example-team-size">Team size</span>
        {/* The thumb says the same in words through getAriaValueText. */}
        <span aria-hidden="true">{members(team)}</span>
      </p>
      <Slider
        aria-labelledby="example-team-size"
        aria-describedby="example-team-total"
        min={1}
        max={100}
        value={team}
        onValueChange={setTeam}
        getAriaValueText={(_, value) => members(value)}
      />
      <p id="example-team-total" className="text-muted-foreground">
        Team plan: ${memberPrice * team} a month
      </p>
    </div>
  )
}
