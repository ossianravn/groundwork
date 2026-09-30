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
import { ScrollAreaExample } from "@/features/reference/examples/scroll-area-example"
import scrollAreaSource from "@/features/reference/examples/scroll-area-example?raw"
import { DrawerExample } from "@/features/reference/examples/drawer-example"
import drawerSource from "@/features/reference/examples/drawer-example?raw"
import { CodeBlockExample } from "@/features/reference/examples/code-block-example"
import codeBlockSource from "@/features/reference/examples/code-block-example?raw"
import { SnippetExample } from "@/features/reference/examples/snippet-example"
import snippetSource from "@/features/reference/examples/snippet-example?raw"
import { PromptInputExample } from "@/features/reference/examples/prompt-input-example"
import promptInputSource from "@/features/reference/examples/prompt-input-example?raw"
import { MessageResponseExample } from "@/features/reference/examples/message-response-example"
import messageResponseSource from "@/features/reference/examples/message-response-example?raw"
import { ReasoningExample } from "@/features/reference/examples/reasoning-example"
import reasoningSource from "@/features/reference/examples/reasoning-example?raw"
import { ToolExample } from "@/features/reference/examples/tool-example"
import toolSource from "@/features/reference/examples/tool-example?raw"
import { SourcesExample } from "@/features/reference/examples/sources-example"
import sourcesSource from "@/features/reference/examples/sources-example?raw"
import { InlineCitationExample } from "@/features/reference/examples/inline-citation-example"
import inlineCitationSource from "@/features/reference/examples/inline-citation-example?raw"
import { ChainOfThoughtExample } from "@/features/reference/examples/chain-of-thought-example"
import chainOfThoughtSource from "@/features/reference/examples/chain-of-thought-example?raw"
import { PlanExample } from "@/features/reference/examples/plan-example"
import planSource from "@/features/reference/examples/plan-example?raw"
import { ConfirmationExample } from "@/features/reference/examples/confirmation-example"
import confirmationSource from "@/features/reference/examples/confirmation-example?raw"
import { QueueExample } from "@/features/reference/examples/queue-example"
import queueSource from "@/features/reference/examples/queue-example?raw"
import { QuestionExample } from "@/features/reference/examples/question-example"
import questionSource from "@/features/reference/examples/question-example?raw"

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
  { id: "scroll-area", Component: ScrollAreaExample, source: scrollAreaSource },
  { id: "drawer", Component: DrawerExample, source: drawerSource },
  { id: "code-block", Component: CodeBlockExample, source: codeBlockSource },
  { id: "snippet", Component: SnippetExample, source: snippetSource },
  {
    id: "prompt-input",
    Component: PromptInputExample,
    source: promptInputSource,
  },
  {
    id: "message-response",
    Component: MessageResponseExample,
    source: messageResponseSource,
  },
  { id: "reasoning", Component: ReasoningExample, source: reasoningSource },
  { id: "tool", Component: ToolExample, source: toolSource },
  { id: "sources", Component: SourcesExample, source: sourcesSource },
  {
    id: "inline-citation",
    Component: InlineCitationExample,
    source: inlineCitationSource,
  },
  {
    id: "chain-of-thought",
    Component: ChainOfThoughtExample,
    source: chainOfThoughtSource,
  },
  { id: "plan", Component: PlanExample, source: planSource },
  {
    id: "confirmation",
    Component: ConfirmationExample,
    source: confirmationSource,
  },
  { id: "queue", Component: QueueExample, source: queueSource },
  { id: "question", Component: QuestionExample, source: questionSource },
]
