import { Kbd, KbdGroup } from "@/kit/ui/kbd"

const shortcuts = [
  { action: "Find a project", keys: ["Ctrl", "K"] },
  { action: "Keyboard shortcuts", keys: ["?"] },
  { action: "Close an overlay", keys: ["Esc"] },
]

export function KbdExample() {
  return (
    <dl className="grid max-w-sm gap-2 text-sm">
      {shortcuts.map((shortcut) => (
        <div
          key={shortcut.action}
          className="flex items-center justify-between"
        >
          <dt>{shortcut.action}</dt>
          <dd>
            <KbdGroup>
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </KbdGroup>
          </dd>
        </div>
      ))}
    </dl>
  )
}
