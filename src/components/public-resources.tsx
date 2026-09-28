import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import type { PublicLinkComponent } from "@/components/public-link"

export function PublicResources({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="public-resources-trigger">
        Resources <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem render={<LinkComponent destination="blog" />}>
            Articles
          </DropdownMenuItem>
          <DropdownMenuItem render={<LinkComponent destination="changelog" />}>
            Changelog
          </DropdownMenuItem>
          <DropdownMenuItem render={<LinkComponent destination="help" />}>
            Help
          </DropdownMenuItem>
          <DropdownMenuItem render={<LinkComponent destination="contact" />}>
            Contact
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
