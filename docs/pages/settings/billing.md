# Billing and invoices

Status: core local example implemented, awaiting review. Shell: Settings. Primary inventory ownership: SETT-08, SETT-09.

## User goal and composition

Understand the current plan and workspace size, change the sample plan, and download previous invoices. `/app/demo/settings/billing` uses the existing settings surface: current plan and period amount, active member/project counts, then invoice history. Manage plan opens a compact dialog; the full pricing comparison is not repeated here.

## Actions and outcomes

- The approved Starter/Team/Business catalog is shared with Pricing. The dialog shows monthly/yearly per-member prices and the full workspace total for that period. Save updates the current plan in memory immediately; all plans continue to expose the complete demo. No charges, proration, payment credentials or external portal.
- Cancel, Close and Escape discard the dialog selection and restore focus to its opener. Reopening starts with the saved plan. An unchanged selection cannot be submitted. Normal completion is visible in the updated plan summary without an inserted success banner.
- Counts include active members and all projects. These are counts, not quota meters; no entitlement limits, reset periods or warning thresholds have been invented.
- Invoice links use native same-origin downloads and return actual, clearly marked PDFs. Each record is a historical snapshot: changing plan, members or workspace name does not rewrite it or produce a fake invoice. Currency and paid status are textual.
- A workspace with no plan has Choose plan; new workspaces have an empty invoice state. Plan selection during sign-up is preserved.

## Data and persistence

`src/demo/data/billing.json` owns the catalog, baseline Team monthly subscription and three sample paid invoices. `useWorkspaceIdentity` owns the subscription and invoice records with the existing workspace identity. Navigation retains them; reset/reload restores the fixture; starting a workspace clears invoice history.

`public/invoices/` contains the sample files. `tools/generate-sample-invoices.py` regenerates them from the JSON using ReportLab as an authoring tool, not a runtime application dependency. No invoice is a tax document or evidence of an actual payment.

## Responsive behavior and verification limits

The summary and three-column invoice list fit at 320px. The plan dialog keeps name and price in aligned rows and uses the primitive's radio keyboard behavior and dialog focus/dismissal. Shared spacing, font and density tokens apply; short viewports can scroll the dialog.

PDFs were rendered and inspected, and the server returned HTTP 200 with `application/pdf`. The browser automation download command reported cancellation in both the existing session and a fresh session configured with a download directory; native saving remains unverified in that harness. No replacement download mechanism was added to work around this tool limitation.

## Later variants

Quota meters require an agreed entitlement model. Open/past-due/void invoices, asynchronous billing failures, pending states, permission variants, external portal and payment processing remain outside this delivery. No simulated failure is added to the synchronous in-memory plan setter.
