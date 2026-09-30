# Assistant

Status: foundations and agent activity implemented, awaiting review (2026-09-30). Shell: App. Inventory: AI-01 to AI-10, DEV-01, DEV-02. The maintainer's plan adds approvals, conversation history, attachments, artifacts and the coding-agent specimen in later steps.

## User goal and composition

Ask a question about the workspace and get an answer that points back to the records. `/app/demo/assistant` is a primary workspace section (sidebar item Assistant). The top bar's breadcrumb names the page; New chat appears there once a conversation has started.

The page is one column at a reading width (46rem): the transcript fills the height under the header and the composer sits below it. The scroller spans the page so its scrollbar sits at the edge. An empty conversation says what the assistant can read, that nothing leaves the browser and that replies are scripted, and offers three starting questions.

A question appears as a right-aligned bubble and is anchored at the top of the view; the reply grows below it without a bubble, as prose with tables, links and code blocks. Thinking… shimmers until the first words arrive. A finished reply gets Copy and, if it is the latest, Regenerate, followed by follow-up questions. Stopping keeps the partial reply and says "You stopped this reply." A failed reply keeps what arrived and shows the failure with Try again where it happened.

## Answers

Replies are scripted: `src/demo/data/assistant.json` holds the copy, the starting questions and the keyword topics; `src/demo/assistant/assistant-answers.ts` composes each answer from the records at the moment the question is sent. Prompts match topics by whole words; anything else gets a fallback that lists what can be asked.

- **At risk:** the assistant reasons about the question (a reasoning part), then calls `searchProjects`. That tool part's parameters stream in, it runs, and it returns the active projects. The answer uses the rule it states: projects overdue, due within a week with more than a quarter of their tasks open, or due within two weeks with more than half open. It lists them in a table with links, names the most urgent, and cites the projects it read; the sources follow the text.
- **This week:** the assistant reports three progress steps (data parts replaced by id as each completes). It then lists the tasks completed in the seven days to the demo date, by project and person, citing Activity as its source.
- **API:** a curl and a TypeScript example against the illustrative API, and a link to API keys.

Replies link to project pages and settings with in-app navigation; the host supplies the link renderer, so the feature does not import the router.

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

The person's own choice to open or close reasoning or steps is kept. Nothing here takes focus. Copied text and the spoken reply leave citation markers out.

## Interaction and accessibility

- Enter sends and Shift+Enter adds a line; Enter is left to an input method while it composes. While a reply streams, Enter does nothing, so a follow-up can be drafted, and the send button becomes Stop. The button is never disabled; an empty send returns focus to the text.
- Choosing a suggestion, Regenerate or Try again removes that control, so focus moves to the composer. New chat also focuses the composer.
- The transcript is a log that is not announced as it changes; a status region says the assistant is replying and then reads the finished reply as plain sentences, with code replaced by "(code example)". Stopped and failed replies are announced as such.
- Each message starts with a visually hidden "You:" or "Assistant:". Icon actions carry tooltips that repeat their accessible names. Copy reports its outcome.
- Code blocks scroll horizontally within themselves and take keyboard focus; tables scroll within their frame. The page never scrolls sideways at phone width.

## Scope and limits

One conversation per session, no history list, branches, attachments or model choice yet; tools run without approval. There is no model and no network: answers cover three topics. The API in the answer is illustrative and does not respond. Screen-reader output was checked through the status text, not with a screen reader. Inherits the [quality contract](../../quality.md), [density rules](../../density.md), [shared shells](../../shells.md) and [demo data contract](../../demo-data.md).
