import type { ShellBrand } from "./shell-link"

export function BrandMark({
  brand,
  nameClassName,
}: {
  brand: ShellBrand
  nameClassName?: string
}) {
  return (
    <>
      <span className="brand-symbol">{brand.icon}</span>
      <span className={nameClassName}>{brand.name}</span>
    </>
  )
}
