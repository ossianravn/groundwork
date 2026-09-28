import { parsePlan, parseBilling, type PlanSelection } from "@/demo/billing"

const defaultReturn = "/app/demo/overview?period=14"

export function accessReturnTo(value: string): string {
  if (!value.startsWith("/app/demo/")) return defaultReturn
  const url = new URL(value, "https://demo.invalid")

  const known =
    /^\/app\/demo\/(overview|inbox|analytics|activity|projects(?:\/[^/]+(?:\/edit)?)?|settings\/(profile|appearance|notifications|security|workspace|team|billing|api-keys|webhooks))$/u

  return url.origin === "https://demo.invalid" && known.test(url.pathname)
    ? `${url.pathname}${url.search}${url.hash}`
    : defaultReturn
}

interface AccessSearchInput {
  returnTo?: unknown
  token?: unknown
}

export function parseAccessSearch(search: AccessSearchInput) {
  try {
    return {
      returnTo: accessReturnTo(String(search.returnTo ?? "")),
      token: String(search.token ?? ""),
    }
  } catch {
    // Uncoercible JSON query values cannot identify a destination or reset link.
    return { returnTo: defaultReturn, token: "" }
  }
}

export function parseSignUpSearch(
  search: AccessSearchInput & { plan?: unknown; billing?: unknown },
): ReturnType<typeof parseAccessSearch> & Partial<PlanSelection> {
  const plan = parsePlan(search)

  return {
    ...parseAccessSearch(search),
    plan,
    billing: plan ? parseBilling(search).billing : undefined,
  }
}

export function parseEmailReceiptSearch(
  search: AccessSearchInput & { purpose?: unknown },
) {
  return {
    ...parseAccessSearch(search),
    purpose: search.purpose === "sign-in" ? "sign-in" : "recovery",
  }
}
