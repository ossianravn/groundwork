# Assistant

Status: implemented, awaiting review (2026-09-30). Shell: App. Inventory: AI-01 to AI-23, DEV-01, DEV-02. The developer components (DEV-03 to DEV-07) are shown in the coding-agent specimen (AI-24, `/reference/specimens/coding-agent`), not here, because Tandem's assistant works on projects rather than code.

## User goal and composition

Ask a question about the workspace and get an answer that points back to the records. `/app/demo/assistant` is a primary workspace section (sidebar item Assistant). The top bar's breadcrumb names the page; New chat appears there once a conversation has started.

History of past conversations sits beside the chat from 72rem. Hide history (beside its label) hides it for the session, and the top bar's History action brings it back; focus moves to whichever of the two remains. Below 72rem, the History action opens history in a sheet. The chat is one column at a reading width (46rem): the transcript fills the height under the header and the composer sits below it. The scroller spans the column so its scrollbar sits at the edge.

Before the first message, the composer sits in the middle of the page under a larger heading ("What would you like to know?"). A line says the answers are scripted and nothing leaves the browser, and four starting questions sit below the composer. Sending the first message moves the composer to the bottom with a view transition, where supported and unless reduced motion is requested.

## Composer

A rounded surface holds any attachments, then the text, then a row of tools:

- **+ menu:** add photos and files, or one of the open projects as context.
- **Context ring:** once a reply has reported usage, it opens the window used, the last input and output tokens, and an estimated cost for the conversation.
- **Model:** Fast (quicker, no visible reasoning), Balanced or Thorough (slower).
- **Send:** a round button whose tooltip carries the keys, Enter to send and Shift+Enter for a new line. It becomes Stop during a reply.

Files can also be dropped or pasted. Up to five images, PDFs, text or CSV files of at most 10 MB each are accepted; anything else is refused with the reason. Sent attachments appear as chips above the question. Files travel as AI SDK file parts and projects as data parts. An attached project counts as named in the question, so "Add a launch checklist" with Mobile app attached plans for Mobile app. The scripted assistant says plainly that it cannot read file contents.

A question appears as a right-aligned bubble and is anchored at the top of the view; the reply grows below it without a bubble, as prose with tables, links and code blocks. Thinking… shimmers until the first words arrive. A finished reply gets Copy and, if it is the latest, Regenerate, followed by follow-up questions. Stopping keeps the partial reply and says "You stopped this reply." A failed reply keeps what arrived and shows the failure with Try again where it happened.

## Answers

Replies are scripted: `src/demo/data/assistant.json` holds the copy, the starting questions and the keyword topics; `src/demo/assistant/assistant-answers.ts` composes each answer from the records at the moment the question is sent. Prompts match topics by whole words; anything else gets a fallback that lists what can be asked.

- **Catch up** (AI-28): "Catch me up on Brand refresh" answers with components instead of prose, as an [interactive answer](#interactive-answers). It reads the project's tasks and activity (two steps), then builds a heading that states the result (on track for its due date, or how many days late at the last two weeks' pace), a short summary citing Activity and the project, four figures (done, completed this week, open, due) with trend lines, a callout for open tasks without an owner, the latest activity and the project's files. Without a named project the assistant asks which one.
- **Land a project** (AI-28 to AI-30): "Can we land Website redesign by 8 October?" answers with a plan. The heading states the result ("can land 6 Oct, 2 days early"), and the text gives both estimates: as assigned, at each person's pace working through their projects in due-date order (13 Oct), and the team's recent pace on this project alone (1 Nov). The plan proposes grouped changes (give unowned tasks to people with room, move the slowest person's last tasks) and, when the date comes first and help runs out, defers the newest tasks. Its projection, who finishes when, changes and summary are linked; an Adjust the plan form chooses the priority and who can help, and Apply the plan asks for approval before reassigning tasks and posting deferred ones as a comment. Without a named open project the assistant asks which one.
- **Balance the team** (AI-28, AI-29): "Who is overloaded?" answers with a plan across the open projects, recomposed from the same components. The heading names who is overloaded and what the suggested moves achieve ("22 moves to Ava and Mia land every project on time"); the text gives each overloaded person's latest late part and why (open tasks against their pace), who has room, and the model's assumptions, leaving out tasks without an owner. Who has what stacks each person's tasks by project, in the project hues Analytics uses; when each project lands draws a bar to its date against a due tick, with the time the moves save. The suggested moves, one per person and project, take tasks from whoever runs past a due date to people who still finish everything in time; they can be removed, added back or changed task by task. Apply the moves asks for one approval across the projects before reassigning; a team's plan never defers work.
- **At risk:** the assistant reasons about the question (a reasoning part), then calls `searchProjects`. That tool part's parameters stream in, it runs, and it returns the active projects. The answer uses the rule it states: projects overdue, due within a week with more than a quarter of their tasks open, or due within two weeks with more than half open. It lists them in a table with links, names the most urgent, and cites the projects it read; the sources follow the text.
- **This week:** the assistant reports three progress steps (data parts replaced by id as each completes). It then lists the tasks completed in the seven days to the demo date, by project and person, citing Activity as its source.
- **Launch checklist:** the one answer that changes records. If the prompt names no open project, the assistant asks which one first. Otherwise it streams a five-task plan (the owner takes the first two), then asks for approval to add the tasks. Approving adds them to the end of the project's task list, as one change in the shared demo state. The outcome links to the project, whose page offers the breadcrumb's Assistant link. Declining changes nothing.
- **Status update:** "Draft a status update for Mobile app" streams a document artifact written from the project's week: its status and progress, this week's activity, the next open tasks and a risk line. Copy and Download keep the markdown. Post to project adds it to the project as a comment, once; the footer says so and links to the project, and focus moves to that link. Without a named project the assistant asks which one (the same question as the checklist, with its purpose).
- **Help guides:** a question naming a help guide gets its summary and sections, cites the guide and links to it.
- **API:** a curl and a TypeScript example against the illustrative API, and a link to API keys.

Replies link to project pages and settings with in-app navigation; the host supplies the link renderer, so the feature does not import the router.

### Interactive answers

An interactive answer is composed from a library of components rather than written as markdown. The assistant calls `showAnswer`, a display tool whose input is the answer: a tree of nodes, each a component's name, its props and any children. The AI SDK parses the input after every streamed delta, and the kit's `AnswerRenderer` (`src/kit/answer/`) draws what has arrived: text and headings read as they are written, other parts hold their place with a placeholder until they are complete, and a part whose props are invalid or whose component the library does not know is left out. The call completes as soon as its input does, and a new step follows, so nothing is sent back.

Tandem's library (`features/assistant/answers/tandem-answers.tsx`) is the kit's heading, text, figures, section, callout and form, plus Tandem's recent work, project files, and plans for a project or the team. Each component declares a Zod schema, which validates what the model wrote, and a text form: Copy, the status announcement and the Conversation panel read an answer in words. The library also gives the tool's JSON schema and a description of its components for a real model's system prompt.

**Editing an answer.** A plan's views read one shared state, the moves the person keeps (`useAnswerState`). A change is in the plan, partly edited or left out; removing it, adding an option, or giving one of its tasks to someone else (expand the change, then choose who takes each task) moves the projection or each project's date, who finishes when and the summary at once. Bars keep one scale while the person edits, and each view says what changed against the work as assigned ("9 tasks (was 27)", "16 Oct (was 26 Nov)"). The summary is announced politely as it changes. The conversation keeps each answer's state by its `showAnswer` call, so it survives scrolling and navigation; reload and Reset clear it.

**Edits travel with the next turn.** Every request carries the conversation's answer states. Apply the plan, or asking to apply it in words, applies the plan as the person left it; the approval names what changes ("Apply 9 changes to Website redesign?", or for the team "Apply 22 changes to Website redesign and Design system?") and lists who takes how many. Approving reassigns the tasks and posts any deferred ones as a comment (they stay in the project); declining changes nothing.

**Forms answer back.** A Form block's choices are kept with the answer. Sending posts a message that reads as a sentence ("Update the plan: Hit 8 Oct; Who can help: Mia Davis") with the values in a `data-action` part, and the assistant plans again with them. Forms and plans take changes only in the latest answer, once it has finished streaming; earlier ones keep their state and are read-only. Sending from an answer returns focus to the composer.

## State and navigation

- The conversation is an AI SDK `Chat` held in demo state (`use-assistant.ts`): navigation keeps it; New chat, Reset demo data and reload start over. The composer draft belongs to the page.
- `useChat` talks to a local `ChatTransport` (`assistant-transport.ts`) that streams UI message chunks at a readable pace, so status, stop, regenerate and errors behave as they would against a server. Each request carries the records to answer from in its body, as a client would send page context.
- Follow-up questions arrive as a `data-suggestions` part after the text.
- `?scenario=assistant-error` fails the first attempt at each question a third of the way through; Try again regenerates it.
- `?scenario=tool-error` makes the first project search fail: the tool row opens to show the error, and the reply says it could not answer. Regenerate succeeds.

## Agent activity

A reply shows its work above the answer, in the order it happened:

- **Reasoning** opens while it streams and folds to "Thought for 2 seconds" when the answer begins.
- **Progress steps** show the current step while working and fold to "Worked through 3 steps"; each step keeps its results as chips.
- **Tool calls** are rows with the tool's name and state (Preparing, Running, Done, Failed). They stay closed unless the call fails; opened, they show the parameters and the result as a readable list.
- **Citations** are numbered pills after the sentence they support. They link to the first source and preview all of them on hover or focus. Consecutive numbers read as a range (2–4). Before the sources arrive, the number shows without a preview.
- **Sources** ("Used 4 sources") list every cited record with its status. The list is the keyboard-reachable record, since previews hold no controls.

## Working plan

Multi-step replies carry the assistant's own plan for the request (AI-25), streamed as a `data-todo` part that is replaced in place as the reply moves through its stages (reasoning, steps, tool call, text, plan, artifact): the current task is in progress, finished ones are done, and a failed reply marks the current task blocked. At-risk projects, this week, status updates and launch checklists have one. The latest reply's plan docks on the composer's top edge as a collapsed bar (title and progress, such as 2/3) that opens upward into the tasks, each with a status icon and a spoken status. It hides while a new question waits for its reply; a task still in progress when the reply was stopped reads as stopped. A working plan is the assistant's to-do list, not a proposal: the launch checklist's Plan and its Confirmation stay in the reply.

## Conversation panel

The top bar's **Conversation** action, or a finished reply's **Thought for …** label, opens a panel about the open conversation (AI-26): beside the chat from 84rem, as a sheet from the right below that. Opening it from a reply's reasoning shows that reply's work with its reasoning expanded. Three tabs, each with a count:

- **Work:** each question with a timeline of what was done for it: reasoning (three lines, Show all), steps, tool calls in words (Searched projects · 4 projects, Asked which project, Add 5 tasks to Mobile app · Waiting for your approval) and the answer's first line, each marked in progress, done, failed, waiting, declined or stopped.
- **Outputs:** interactive answers (their title and the result they state; Writing… while they stream), drafted documents (Writing…, Draft or Posted, with Copy, Download and, once posted, a link to the project), and tasks the assistant proposed or plans it applied (Waiting for approval, Added or Applied with a link to each project changed, or Declined), newest first.
- **Sources:** every page the replies cited, once each, most cited first.

Work items and Show in conversation scroll the transcript to their reply and mark it for a moment; on a narrow screen the sheet closes first and focus returns to Conversation. Reasoning, steps and tool calls also stay in the transcript, so the panel is an overview rather than the only place to read them.

## Settings › Assistant

`/app/demo/settings/assistant` pairs an Agent summary (instructions, tools with Asks first, output) with the default model and a switch per tool: Search projects, Create tasks, Draft status updates. Changes apply at once and last for the session. With a tool off, a question that needs it gets an explanation that links back here, instead of an answer. The instructions are fixed, because scripted replies could not follow edited ones.

## Open in chat

Each help guide offers Ask about this guide. Ask the Tandem Assistant opens the Assistant with a question about the guide in the composer, without sending it; the question then leaves the URL. Open in Claude opens a new tab with the question and the guide's address. There is no ChatGPT entry, because its mark is no longer available from Simple Icons.

## History, versions and restoring

- **Conversations:** each one keeps its own chat, so switching is instant and a reply can finish in the background. Titles come from the first question until renamed in place. Delete offers Undo; deleting the open conversation opens an empty one. New chat reuses the current conversation while it is still empty.
- **Versions:** Regenerate keeps the reply it replaces. The latest reply then shows previous, the position (2 / 2) and next; choosing a version makes it the one the conversation continues from.
- **Restore:** between turns, Restore (on hover or focus, always on touch) removes that question and everything after it, puts the question back in the composer and offers Undo. If the removed turns added tasks, the toast says those stay.

## Decisions and the queue

- **Question:** a client-side `chooseProject` tool call left without output. The page renders the open projects as a radio group; the answer returns with `addToolOutput`, and `sendAutomaticallyWhen` continues the turn to the plan.
- **Approval:** `createTasks` arrives in the AI SDK's approval-requested state as a Confirmation under the plan. Don't add and Add tasks answer with `addToolApprovalResponse`, and the chat sends automatically. The scripted server runs the host's `createTasks` implementation, supplied with the request, only when approved; it then streams the output and a short reply. The decision and outcome replace the actions in place.
- **Waiting:** while a reply waits for an answer or approval, the status region says so. Messages sent meanwhile queue, since a new prompt would leave the decision open. Only the latest reply's question or approval can be answered; older ones read "Not answered" or "Not decided".
- **Queue:** during a reply, Enter queues the message rather than doing nothing. Queued messages sit above the composer, each with Remove, labelled with when they will send. They go one per reply once the assistant is ready.
- Answering, deciding and removing a queued message move focus to the composer, because the control that had focus is gone.

The person's own choice to open or close reasoning or steps is kept. Nothing here takes focus. Copied text and the spoken reply leave citation markers out.

## Interaction and accessibility

- Enter sends and Shift+Enter adds a line; Enter is left to an input method while it composes. While a reply streams, Enter does nothing, so a follow-up can be drafted, and the send button becomes Stop. The button is never disabled; an empty send returns focus to the text.
- Choosing a suggestion, Regenerate or Try again removes that control, so focus moves to the composer. New chat also focuses the composer.
- The transcript is a log that is not announced as it changes; a status region says the assistant is replying and then reads the finished reply as plain sentences, with code replaced by "(code example)". Stopped and failed replies are announced as such.
- Each message starts with a visually hidden "You:" or "Assistant:". Icon actions carry tooltips that repeat their accessible names. Copy reports its outcome.
- Code blocks scroll horizontally within themselves and take keyboard focus; tables scroll within their frame. The page never scrolls sideways at phone width.

## Scope and limits

Conversations last until reload. Token counts are estimated from text length and prices are illustrative. Only createTasks needs approval; the project search is read-only. Added tasks have no Undo in the assistant; remove them from the project. There is no model and no network: answers cover three topics. The API in the answer is illustrative and does not respond. Screen-reader output was checked through the status text, not with a screen reader. Inherits the [quality contract](../../quality.md), [density rules](../../density.md), [shared shells](../../shells.md) and [demo data contract](../../demo-data.md).
