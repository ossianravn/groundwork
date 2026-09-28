import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"

export function Newsletter({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const [subscribed, setSubscribed] = useState(false)
  const result = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (subscribed) result.current?.focus({ preventScroll: true })
  }, [subscribed])

  return (
    <section
      className="public-newsletter public-container"
      aria-labelledby="newsletter-title"
    >
      <div>
        <h2 id="newsletter-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div className="public-newsletter-form">
        {subscribed ? (
          <div
            ref={result}
            tabIndex={-1}
            className="public-subscription-result"
            role="status"
          >
            <Check aria-hidden="true" />
            <p>
              Subscribed in this demo.<span>No email was sent.</span>
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSubscribed(true)
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="newsletter-email">
                  Email address
                </FieldLabel>
                <div className="public-newsletter-controls">
                  <Input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-describedby="newsletter-note"
                    placeholder="you@example.com"
                  />
                  <Button type="submit">Subscribe</Button>
                </div>
                <p id="newsletter-note" className="public-note">
                  Demo form. No emails are sent or stored.
                </p>
              </Field>
            </FieldGroup>
          </form>
        )}
      </div>
    </section>
  )
}
