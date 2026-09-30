import { useState } from "react"
import { ModelSelector } from "@/kit/ai/model-selector"

const models = [
  {
    id: "fast",
    name: "Fast",
    description: "Quick answers without visible reasoning",
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Reasons briefly before answering",
  },
  {
    id: "thorough",
    name: "Thorough",
    description: "Takes longer over each step",
  },
]

export function ModelSelectorExample() {
  const [model, setModel] = useState("balanced")

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Next message uses</span>
      <ModelSelector models={models} value={model} onValueChange={setModel} />
    </div>
  )
}
