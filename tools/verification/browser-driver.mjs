import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  unlinkSync,
  rmdirSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const executable =
  process.env.AGENT_BROWSER_EXECUTABLE ||
  (process.platform === "win32"
    ? join(
        process.env.APPDATA,
        "npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe",
      )
    : "agent-browser")

export function createBrowser(fault) {
  const session = `verify-${process.pid}`

  function browser(...args) {
    const input = args[0] === "eval" ? args.pop() : undefined

    // Background browser processes can inherit pipes on Windows. Files let the
    // CLI exit independently without mistaking a successful launch for a timeout.
    const directory = mkdtempSync(join(tmpdir(), "verification-browser-"))
    const stdout = join(directory, "stdout")
    const stderr = join(directory, "stderr")
    const out = openSync(stdout, "w")
    const err = openSync(stderr, "w")
    let result
    let responseText
    let errorText

    try {
      result = spawnSync(
        executable,
        [
          "--json",
          "--session",
          session,
          "--hide-scrollbars",
          fault === "hidden-scrollbars" ? "true" : "false",
          ...args,
        ],
        {
          encoding: "utf8",
          input,
          stdio: [input === undefined ? "ignore" : "pipe", out, err],
          timeout: 45000,
        },
      )
      responseText = readFileSync(stdout, "utf8")
      errorText = readFileSync(stderr, "utf8")
    } finally {
      closeSync(out)
      closeSync(err)
      unlinkSync(stdout)
      unlinkSync(stderr)
      rmdirSync(directory)
    }

    if (result.error)
      throw new Error(`${args.join(" ")}: ${result.error.message}`)

    const response = JSON.parse(responseText)

    assert.ok(
      result.status === 0 && response.success,
      response.error || errorText,
    )

    return response.data
  }

  return browser
}
