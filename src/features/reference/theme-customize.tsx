import { Button } from "@/kit/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/kit/ui/sheet"
import { PanelHeader } from "@/kit/panel-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/kit/ui/tabs"
import { AppearanceSettings } from "@/kit/theme/appearance-settings"
import type { ThemePreset } from "@/kit/theme/preset"
import type { ThemeColors } from "@/kit/theme/color-tokens"
import { ThemeColorsEditor, ThemeContrast } from "./theme-colors"

export function ThemeCustomize({
  preset,
  resolved,
  onChange,
}: {
  preset: ThemePreset
  resolved: ThemeColors
  onChange: (preset: ThemePreset) => void
}) {
  return (
    <Sheet>
      <SheetTrigger
        className="theme-customize-trigger"
        render={<Button variant="outline" />}
      >
        Customize
      </SheetTrigger>
      <SheetContent
        showCloseButton={false}
        className="panel-sheet appearance-sheet"
        aria-describedby={undefined}
      >
        <PanelHeader title="Customize preview" />
        <Tabs defaultValue="appearance" className="theme-customize-tabs">
          <TabsList variant="line" aria-label="Theme customization">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="contrast">Contrast</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance">
            <AppearanceSettings
              theme={preset.settings}
              onChange={(settings) =>
                onChange({
                  ...preset,
                  settings,
                  colors:
                    settings.accent === preset.settings.accent
                      ? preset.colors
                      : { light: {}, dark: {} },
                })
              }
            />
          </TabsContent>
          <TabsContent value="colors">
            <ThemeColorsEditor
              preset={preset}
              resolved={resolved}
              onChange={onChange}
            />
          </TabsContent>
          <TabsContent value="contrast">
            <ThemeContrast colors={resolved} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
