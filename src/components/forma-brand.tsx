import { Layers2 } from "lucide-react"
import type { ShellBrand } from "@/kit/shell/shell-link"

// The demo product's identity. Replace this to rebrand every shell.
export const formaBrand: ShellBrand = {
  icon: <Layers2 aria-hidden="true" />,
  name: (
    <>
      forma<span className="text-primary">.</span>
    </>
  ),
}
