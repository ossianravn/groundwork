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

    if (phone) browser("click", ".mobile-menu-button")
    browser("click", `${sidebar} .account-menu-trigger`)
    browser("wait", "[role=menuitem]")
    browser("find", "role", "menuitem", "click", "--name", "Appearance")
  }

  return { evaluate, inject, openAppearance }
}
