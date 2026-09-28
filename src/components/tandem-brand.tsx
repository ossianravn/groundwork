import { Layers2 } from "lucide-react"
import type { ShellBrand } from "@/kit/shell/shell-link"

// The demo product's identity. Replace this to rebrand every shell.
export const tandemBrand: ShellBrand = {
  icon: <Layers2 aria-hidden="true" />,
  name: (
    <>
      tandem<span className="text-brand">.</span>
    </>
  ),
}
