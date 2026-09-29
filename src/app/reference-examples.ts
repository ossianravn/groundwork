import { ButtonExample } from "@/features/reference/examples/button-example"
import buttonSource from "@/features/reference/examples/button-example?raw"
import { InputExample } from "@/features/reference/examples/input-example"
import inputSource from "@/features/reference/examples/input-example?raw"
import { SelectExample } from "@/features/reference/examples/select-example"
import selectSource from "@/features/reference/examples/select-example?raw"
import { CheckboxExample } from "@/features/reference/examples/checkbox-example"
import checkboxSource from "@/features/reference/examples/checkbox-example?raw"
import { RadioGroupExample } from "@/features/reference/examples/radio-group-example"
import radioSource from "@/features/reference/examples/radio-group-example?raw"
import { DialogExample } from "@/features/reference/examples/dialog-example"
import dialogSource from "@/features/reference/examples/dialog-example?raw"
import { TabsExample } from "@/features/reference/examples/tabs-example"
import tabsSource from "@/features/reference/examples/tabs-example?raw"
import { AlertExample } from "@/features/reference/examples/alert-example"
import alertSource from "@/features/reference/examples/alert-example?raw"
import { EmptyExample } from "@/features/reference/examples/empty-example"
import emptySource from "@/features/reference/examples/empty-example?raw"
import { TableExample } from "@/features/reference/examples/table-example"
import tableSource from "@/features/reference/examples/table-example?raw"
import { TooltipExample } from "@/features/reference/examples/tooltip-example"
import tooltipSource from "@/features/reference/examples/tooltip-example?raw"
import { RichTextExample } from "@/features/reference/examples/rich-text-example"
import richTextSource from "@/features/reference/examples/rich-text-example?raw"
import { SwitchExample } from "@/features/reference/examples/switch-example"
import switchSource from "@/features/reference/examples/switch-example?raw"
import { ProgressExample } from "@/features/reference/examples/progress-example"
import progressSource from "@/features/reference/examples/progress-example?raw"
import { KbdExample } from "@/features/reference/examples/kbd-example"
import kbdSource from "@/features/reference/examples/kbd-example?raw"
import { ToastExample } from "@/features/reference/examples/toast-example"
import toastSource from "@/features/reference/examples/toast-example?raw"
import { DatePickerExample } from "@/features/reference/examples/date-picker-example"
import datePickerSource from "@/features/reference/examples/date-picker-example?raw"
import { DateRangePickerExample } from "@/features/reference/examples/date-range-picker-example"
import dateRangePickerSource from "@/features/reference/examples/date-range-picker-example?raw"
import { CarouselExample } from "@/features/reference/examples/carousel-example"
import carouselSource from "@/features/reference/examples/carousel-example?raw"
import { HoverCardExample } from "@/features/reference/examples/hover-card-example"
import hoverCardSource from "@/features/reference/examples/hover-card-example?raw"
import { ContextMenuExample } from "@/features/reference/examples/context-menu-example"
import contextMenuSource from "@/features/reference/examples/context-menu-example?raw"

export const referenceExamples = [
  { id: "rich-text", Component: RichTextExample, source: richTextSource },
  { id: "tooltip", Component: TooltipExample, source: tooltipSource },
  { id: "button", Component: ButtonExample, source: buttonSource },
  { id: "input", Component: InputExample, source: inputSource },
  { id: "select", Component: SelectExample, source: selectSource },
  { id: "checkbox", Component: CheckboxExample, source: checkboxSource },
  { id: "radio-group", Component: RadioGroupExample, source: radioSource },
  { id: "dialog", Component: DialogExample, source: dialogSource },
  { id: "tabs", Component: TabsExample, source: tabsSource },
  { id: "alert", Component: AlertExample, source: alertSource },
  { id: "empty", Component: EmptyExample, source: emptySource },
  { id: "table", Component: TableExample, source: tableSource },
  { id: "switch", Component: SwitchExample, source: switchSource },
  { id: "progress", Component: ProgressExample, source: progressSource },
  { id: "kbd", Component: KbdExample, source: kbdSource },
  { id: "toast", Component: ToastExample, source: toastSource },
  { id: "date-picker", Component: DatePickerExample, source: datePickerSource },
  {
    id: "date-range-picker",
    Component: DateRangePickerExample,
    source: dateRangePickerSource,
  },
  { id: "carousel", Component: CarouselExample, source: carouselSource },
  { id: "hover-card", Component: HoverCardExample, source: hoverCardSource },
  {
    id: "context-menu",
    Component: ContextMenuExample,
    source: contextMenuSource,
  },
]
