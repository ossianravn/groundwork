import { AppearanceSettings } from "@/kit/theme/appearance-settings"
import { Button } from "@/kit/ui/button"
import type { useTheme } from "@/kit/theme/use-theme"

export function AppearancePage({
  appearance,
}: {
  appearance: ReturnType<typeof useTheme>
}) {
  return (
    <div className="settings-form">
      <header className="settings-section-heading">
        <h2 id="settings-title">Appearance</h2>
      </header>
      <AppearanceSettings
        theme={appearance.theme}
        onChange={appearance.updateTheme}
      />
      <div className="settings-appearance-footer">
        <p role="status">
          {appearance.saved
            ? "Preferences save on this device."
            : appearance.feedback}
        </p>
        <Button variant="outline" onClick={appearance.restoreDefaults}>
          Restore defaults
        </Button>
      </div>
    </div>
  )
}
