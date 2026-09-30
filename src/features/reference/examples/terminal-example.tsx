import { Terminal } from "@/kit/ui/terminal"

const esc = String.fromCharCode(27)

// Colours come from ANSI codes, mapped to theme roles.
const output = [
  `${esc}[2m> groundwork@0.1.1 build${esc}[22m`,
  `${esc}[2m> vite build${esc}[22m`,
  "",
  `${esc}[36mvite v7.1.3${esc}[39m ${esc}[32mbuilding for production...${esc}[39m`,
  `${esc}[32m✓${esc}[39m 2118 modules transformed.`,
  `${esc}[33m(!) Some chunks are larger than 500 kB after minification.${esc}[39m`,
  `${esc}[90mdist/${esc}[39m${esc}[36massets/index.js${esc}[39m  ${esc}[1m565.12 kB${esc}[22m`,
  `${esc}[32m✓ built in 6.42s${esc}[39m`,
].join("\n")

export function TerminalExample() {
  return (
    <Terminal title="$ npm run build" output={output} className="max-w-2xl" />
  )
}
