import { useState } from "react"
import { getRouteApi, Link } from "@tanstack/react-router"
import type { ShellLinkProps } from "@/kit/shell/shell-link"
import { formatDate } from "@/demo/model"
import { defaultPatternFilters } from "./pattern-search"
import {
  MobileTabsSpecimen,
  type SpecimenTab,
} from "@/features/reference/specimens/mobile-tabs-specimen"
import {
  ConsentSpecimen,
  type ConsentChoice,
} from "@/features/reference/specimens/consent-specimen"
import { CodingAgentSpecimen } from "@/features/reference/specimens/coding-agent-specimen"

const mobileTabs = getRouteApi("/reference/specimens/mobile-tabs")

const consentKey = "groundwork.consent-specimen.v1"

function TabLink({ destination, ...props }: ShellLinkProps<SpecimenTab>) {
  return (
    <Link
      {...props}
      to="/reference/specimens/mobile-tabs"
      search={{ tab: destination }}
    />
  )
}

function SpecimenNote({ id, children }: { id: string; children: string }) {
  return (
    <p>
      {children}{" "}
      <Link
        to="/reference/patterns/$patternId"
        params={{ patternId: id }}
        search={{ ...defaultPatternFilters, example: 0 }}
      >
        About {id}
      </Link>
    </p>
  )
}

export function MobileTabsRoute() {
  const { tab } = mobileTabs.useSearch()

  return (
    <>
      <title>Mobile tab navigation · Reference specimen</title>
      <MobileTabsSpecimen
        tab={tab}
        LinkComponent={TabLink}
        note={
          <SpecimenNote id="NAV-07">
            Reference specimen: a phone shell with bottom tabs. The demo keeps
            its sidebar.
          </SpecimenNote>
        }
      />
    </>
  )
}

// The stored choice is parsed at this boundary; anything unreadable counts
// as no choice, so the banner asks again.
function readChoice(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(consentKey)

    if (!raw) return null

    const saved = new Map<string, unknown>(Object.entries(JSON.parse(raw)))

    if (!saved.has("date")) return null

    return {
      analytics: saved.get("analytics") === true,
      marketing: saved.get("marketing") === true,
      date: String(saved.get("date")),
    }
  } catch (error) {
    console.warn("Consent specimen: stored choice unreadable", error)

    return null
  }
}

function writeChoice(choice: ConsentChoice | null) {
  try {
    if (choice) localStorage.setItem(consentKey, JSON.stringify(choice))
    else localStorage.removeItem(consentKey)
  } catch (error) {
    // The choice still applies for this visit.
    console.warn("Consent specimen: choice not saved", error)
  }
}

export function ConsentRoute() {
  const [choice, setChoice] = useState(readChoice)

  return (
    <>
      <title>Cookie consent · Reference specimen</title>
      <ConsentSpecimen
        choice={choice}
        onChoose={(next) => {
          const saved = {
            ...next,
            date: formatDate(new Date().toISOString().slice(0, 10)),
          }

          writeChoice(saved)
          setChoice(saved)
        }}
        onForget={() => {
          writeChoice(null)
          setChoice(null)
        }}
        note={
          <SpecimenNote id="MKT-12">
            Reference specimen: Tandem sets no optional cookies, so the demo
            never asks.
          </SpecimenNote>
        }
      />
    </>
  )
}

export function CodingAgentRoute() {
  return (
    <>
      <title>Coding agent · Reference specimen</title>
      <CodingAgentSpecimen
        note={
          <SpecimenNote id="AI-24">
            Reference specimen: a recorded coding-agent session. Tandem's own
            assistant works on projects, not code.
          </SpecimenNote>
        }
      />
    </>
  )
}
