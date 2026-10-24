// Page steps shared by the browser scenarios: evaluating a function in the
// page, injecting CSS for calibration faults and opening Appearance.
export function pageSteps(browser) {
  function evaluate(fn, ...args) {
    return browser(
      "eval",
      "--stdin",
      `(${fn.toString()})(...${JSON.stringify(args)})`,
    ).result
  }

  function inject(css) {
    evaluate((text) => {
      const style = document.createElement("style")

      style.textContent = text
      document.head.append(style)
    }, css)
  }

  // Appearance opens from the account menu, in the navigation sheet on phones.
  function openAppearance() {
    const phone = evaluate(
      () => !document.querySelector(".desktop-sidebar").offsetWidth,
    )

    const sidebar = phone ? ".mobile-sidebar" : ".desktop-sidebar"

    // The sheet takes focus once open, which scrolls it to its start; a
    // click measured before that lands on whatever scrolls into its place.
    if (phone) {
      browser("click", ".mobile-menu-button")
      browser(
        "wait",
        "--fn",
        `document.querySelector(".mobile-sidebar")?.contains(document.activeElement) && !document.querySelector(".mobile-sidebar[data-starting-style], .mobile-sidebar [data-starting-style]")`,
      )
    }

    browser("click", `${sidebar} .account-menu-trigger`)
    browser("wait", "[role=menuitem]")
    browser("find", "role", "menuitem", "click", "--name", "Appearance")
  }

  return { evaluate, inject, openAppearance }
}
