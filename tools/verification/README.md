# Optional verification tools

[AGENTS.md](../../AGENTS.md#verification-and-completion) owns check selection and stopping; the [quality contract](../../docs/quality.md) owns product acceptance criteria. These are reusable checks for specific risks, not a required workflow. They drive Chromium through the [`agent-browser`](https://www.npmjs.com/package/agent-browser) CLI, installed globally; `AGENT_BROWSER_EXECUTABLE` overrides its location.

## Run the check that answers the question

Run existing package scripts directly when appropriate (`npm.cmd` in PowerShell). Choose the affected test files rather than a full suite when they cover the risk. Documentation and low-impact visual changes may be verified by direct inspection; no automated-check quota applies. A successful command only establishes what it exercised.

Browser scenarios for recurring risks:

```sh
node tools/verification/browser.mjs controls
node tools/verification/browser.mjs scrollbar
node tools/verification/browser.mjs overlay
```

Choose an individual scenario for its risk; these are not a sequence to execute for every UI change. Reuse the Vite server on port 5173. These scripts use the installed `agent-browser` CLI in isolated sessions, preserve user tabs/preferences, and close their session afterward. `AGENT_BROWSER_EXECUTABLE` and `VERIFY_URL` override the executable and target. They do not install dependencies. If this setup is unavailable, use a working real browser for the affected observation instead of extending routine work into harness repair.

| Scenario | What it checks | Limit |
| --- | --- | --- |
| `controls` | Chart period, project search, Status and Owner heights at both densities | Four peers at default appearance; does not judge the whole composition |
| `scrollbar` | Native inset scrollbar; modal open/close background geometry and focus | Chromium on the current OS; an absent native scrollbar is an unexercised condition |
| `overlay` | Appearance containment and reachable Close at 320px with 200% root text | Root text enlargement is not browser zoom or full accessibility coverage |

Output defaults to `.artifacts/verification/browser/`; `VERIFY_ARTIFACT_DIR` overrides it. Inspect screenshots when visual correctness matters. Calibration fault arguments deliberately introduce known defects and should fail; use those only when maintaining a check's sensitivity.

### Style snapshot

For a reorganization that must not change appearance (moving stylesheets, splitting components, renaming classes), record computed styles and geometry before and after, then compare:

```sh
node tools/verification/style-snapshot.mjs capture before
node tools/verification/style-snapshot.mjs capture after
node tools/verification/style-snapshot.mjs compare before after
```

It covers 29 routes plus 9 open states (dialogs, sheets, a popover, Select and Combobox lists) at Light/Comfortable/Indigo 1440px and Dark/Compact/Neutral 390px, about 90 seconds per capture. It lists each differing element with its changed properties, and two captures of unchanged code compare clean. It does not cover hover and focus states, collapsed navigation, other open menus, coarse pointers or forced colors; inspect those directly when a change affects them. A difference is evidence to explain, not automatically a defect; intended text changes also alter geometry.
