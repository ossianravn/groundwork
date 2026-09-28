import { useEffect, useRef, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/kit/ui/card"

export function AccessLayout({
  title,
  description,
  children,
  footer,
  demoLink,
  homeLink,
  progress,
  width = "default",
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  demoLink: ReactNode
  homeLink: ReactNode
  progress?: ReactNode
  width?: "default" | "wide"
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [title])

  return (
    <main className="access-page">
      <title>{title} · tandem</title>
      <div className="access-column" data-width={width}>
        <div className="access-brand-row">
          {homeLink}
          {demoLink}
        </div>
        {progress}
        <Card className="access-card">
          <CardHeader>
            <h1 ref={heading} tabIndex={-1}>
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && (
            <CardFooter className="access-footer">{footer}</CardFooter>
          )}
        </Card>
        <p className="access-disclosure">
          Interactive demo. Use sample details. No account is created, passwords
          are not stored, and no email is sent. Provider sign-in is simulated.
        </p>
      </div>
    </main>
  )
}
