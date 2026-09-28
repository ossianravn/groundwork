import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/kit/ui/accordion"

export function PublicFaq({
  questions,
  title = "A few things to know.",
}: {
  questions: { question: string; answer: string }[]
  title?: string
}) {
  return (
    <section
      className="public-questions public-container"
      aria-labelledby="faq-title"
    >
      <h2 id="faq-title">{title}</h2>
      <Accordion>
        {questions.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>
              <p>{answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
