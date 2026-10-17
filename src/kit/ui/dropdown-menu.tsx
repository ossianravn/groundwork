import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

// Adapted from shadcn's base-nova menu using the project's shared geometry.
const DropdownMenu = MenuPrimitive.Root

const DropdownMenuTrigger = MenuPrimitive.Trigger

const DropdownMenuGroup = MenuPrimitive.Group

function DropdownMenuContent({
  className,
  align = "end",
  ...props
}: MenuPrimitive.Popup.Props & {
  align?: MenuPrimitive.Positioner.Props["align"]
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        sideOffset={4}
        collisionPadding={8}
        positionMethod="fixed"
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("dropdown-menu-content", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn("dropdown-menu-item", className)}
      {...props}
    />
  )
}

const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup

/**
 * One choice in a radio group; the chosen one shows a check at the end.
 * The menu stays open after a choice unless the item sets `closeOnClick`.
 */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn("dropdown-menu-item", className)}
      {...props}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator
        keepMounted
        className="ms-auto flex size-4 shrink-0 items-center justify-center data-unchecked:invisible"
      >
        <CheckIcon aria-hidden="true" />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      className={cn("dropdown-menu-label", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator(props: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator className="dropdown-menu-separator" {...props} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
}
