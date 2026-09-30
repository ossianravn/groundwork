import { useState } from "react"
import { Question } from "@/kit/ai/question"

export function QuestionExample() {
  const [answer, setAnswer] = useState<string>()

  return (
    <Question
      className="max-w-xl"
      question="Which project should the checklist go into?"
      options={[
        { value: "brand", label: "Brand refresh", description: "due 28 Sept" },
        { value: "mobile", label: "Mobile app", description: "due 30 Sept" },
      ]}
      otherLabel="Another project"
      answer={answer}
      onAnswer={(choice) =>
        setAnswer(choice.kind === "option" ? choice.label : choice.text)
      }
    />
  )
}
