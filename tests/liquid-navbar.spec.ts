import { test, expect } from "@playwright/test";

test("liquid navigation preserves the app and follows routes and browser history", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toHaveAttribute("data-gl", /on|off/);
  await expect(
    nav.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await nav.evaluate((element) =>
    element.setAttribute("data-persistent", "yes"),
  );
  await nav.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(nav).toHaveAttribute("data-persistent", "yes");
  await expect(
    nav.getByRole("link", { name: "Contact", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(
    nav.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/product/bldc-essential");
  await expect(nav.getByRole("link", { name: "Our products" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("keyboard navigation moves focus and Enter activates the selected link", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "Home", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(nav.getByRole("link", { name: "Our products" })).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/products$/);
  await page.keyboard.press("End");
  await expect(
    nav.getByRole("link", { name: "Contact", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    nav.getByRole("link", { name: "Home", exact: true }),
  ).toBeFocused();
});

test("CSS fallback moves the selection without WebGL and respects reduced motion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toHaveAttribute("data-gl", "off");
  const drop = nav.locator(".nimbus-drop");
  await expect(drop).toBeVisible();
  const homeTransform = await drop.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await nav.getByRole("link", { name: "Contact", exact: true }).click();
  await expect
    .poll(() => drop.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(homeTransform);
  await expect
    .poll(async () => {
      const selection = await drop.boundingBox();
      const target = await nav
        .getByRole("link", { name: "Contact", exact: true })
        .boundingBox();
      return Math.abs(
        selection!.x + selection!.width / 2 - target!.x - target!.width / 2,
      );
    })
    .toBeLessThan(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await nav.getByRole("link", { name: "Our products" }).click();
  await expect(nav.getByRole("link", { name: "Our products" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    nav.getByRole("link", { name: "Our products" }).locator("svg"),
  ).toHaveCSS("animation-name", "none");
  await expect
    .poll(async () => {
      const selection = await drop.boundingBox();
      const target = await nav
        .getByRole("link", { name: "Our products" })
        .boundingBox();
      return Math.abs(selection!.width - target!.width);
    })
    .toBeLessThan(1);
});

test("the liquid navbar fits phone, tablet and desktop widths and closes on Escape", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 641, 768, 900, 901, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width <= 640)
      await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Navbar overflow at ${width}px`,
    ).toBeTruthy();
    if (width <= 640) {
      await nav.getByRole("link", { name: "Contact", exact: true }).focus();
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeFocused();
    }
  }
});
