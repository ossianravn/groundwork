import { Children, type ReactNode } from "react"

/** A titled column of footer links; place several in footerNavigation. */
export function PublicFooterGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="public-footer-group">
      <h2>{title}</h2>
      <ul>
        {Children.map(children, (child) => (
          <li>{child}</li>
        ))}
      </ul>
    </div>
  )
}
