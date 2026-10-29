import { defaultContactNumbers } from '../shared/contacts';
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("floating paths animate behind the hero without intercepting product navigation", async ({
  page,
}) => {
  await page.goto("/");
  const art = page.locator(".floating-paths-home .floating-paths-art");
  await expect(art).toHaveAttribute("aria-hidden", "true");
  await expect(art.locator(".floating-paths-trails path")).toHaveCount(36);
  await expect(art.locator(".floating-paths-flow path")).toHaveCount(36);
  await expect(art).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".floating-paths-home")).toHaveCSS(
    "position",
    "relative",
  );
  await expect(art).toHaveCSS("position", "absolute");
  const path = art.locator(".floating-paths-flow path").first();
  await expect(path).toHaveAttribute("pathLength", "1");
  await expect(art).toHaveCSS("opacity", "1");
  await expect(path).toHaveAttribute("stroke-dasharray", "0.12 0.38");
  const offset = await path.getAttribute("stroke-dashoffset");
  await expect
    .poll(() => path.getAttribute("stroke-dashoffset"))
    .not.toBe(offset);
  await page.getByRole("link", { name: "See fans & prices" }).click();
  await expect(page).toHaveURL(/products$/);
});

test("floating paths remain static when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const paths = page.locator(".floating-paths-home .floating-paths-art path");
  await expect(paths).toHaveCount(36);
  await expect(page.locator(".floating-paths-flow")).toHaveCount(0);
  await expect(paths.first()).not.toHaveAttribute("pathLength");
  await expect(paths.first()).not.toHaveAttribute("stroke-dashoffset");
  await expect(page.locator("main")).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Play background animation" }).click();
  await expect(page.locator(".floating-paths-flow path")).toHaveCount(36);
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  await expect(page.locator(".floating-paths-flow")).toHaveCount(0);
});

test("catalogue filters, search and reset expose the right offerings", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.getByRole("button", { name: "Jumbohead model", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Nanohead model", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "All fans", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Filter products" })
    .fill("unavailable-example");
  await expect(
    page.getByRole("heading", { name: "No matches just yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all products" }).click();
  await expect(page.locator(".product-card")).toHaveCount(5);
});

test("finish, quantities and bag survive navigation and reload", async ({
  page,
}) => {
  await page.goto("/product/base-model-2-year");
  await page.getByRole("button", { name: "Choose Brown" }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto("/cart");
  await expect(page.locator(".cart-item")).toContainText("Brown");
  await expect(page.locator(".cart-item-price")).toContainText("₹4,700");
  await page.reload();
  await expect(page.locator(".quantity-control > span")).toHaveText("2");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".cart-item-price")).toContainText("₹7,050");
  await page
    .getByRole("button", { name: "Remove Base model in Brown, 2-year warranty" })
    .click();
  await expect(
    page.getByRole("heading", { name: "A little space for something good." }),
  ).toBeVisible();
});

test("comparison selects and removes the actual collections", async ({
  page,
}) => {
  await page.goto("/compare");
  await page.getByRole("button", { name: "Base model · 2-year warranty" }).click();
  await page.getByRole("button", { name: "Base model · 3-year warranty" }).click();
  await expect(page.locator("thead th")).toHaveCount(3);
  await expect(page.locator(".compare-table")).toContainText("₹2,550");
  await expect(page.locator(".compare-table")).toContainText("3 years");
  await page.getByRole("button", { name: "Base model · 2-year warranty" }).click();
  await expect(page.locator("thead th")).toHaveCount(2);
});

test("WhatsApp checkout validates details, preserves edits and hands off the complete order to the right number", async ({
  page,
  context,
}) => {
  // Never contact WhatsApp during the test. Capture the handoff locally.
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<title>Intercepted WhatsApp handoff</title>",
    }),
  );
  await page.goto("/product/base-model-2-year");
  await page.getByRole("button", { name: "Choose Brown" }).click();
  await page.locator(".detail-copy").getByRole("button", { name: "Choose 3-year warranty" }).click();
  await expect(page.locator(".detail-copy").getByRole("button", { name: "Choose 3-year warranty" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".quantity-control > span")).toHaveText("2");
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Review your order" }).click();
  await expect(
    page.getByRole("heading", { name: "Your delivery details" }),
  ).toBeVisible();
  await page.getByLabel("Full name").fill("Anu Test");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("Email (optional)").fill("anu@example.test");
  await page
    .getByLabel("House / building, street and locality")
    .fill("Test House, Test Street");
  await page.getByLabel("Landmark (optional)").fill("Near test library");
  await page.getByLabel("Town / city").fill("Thrissur");
  await page.getByLabel("PIN code").fill("680552");
  await page
    .getByLabel("Anything we should know? (optional)")
    .fill("Please discuss installation.");
  await page.getByRole("radio", { name: "UPI", exact: true }).check();
  await page.getByRole("button", { name: "Review your order" }).click();
  await expect(
    page.getByRole("heading", { name: "Everything look right?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Anu Test");
  await expect(
    page.getByRole("radio", { name: "UPI", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Review your order" }).click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Place order via WhatsApp" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  const handoff = new URL(popup.url());
  expect(handoff.hostname).toBe("wa.me");
  expect(handoff.pathname).toBe(`/${defaultContactNumbers.orderNumber}`);
  const message = handoff.searchParams.get("text")!;
  for (const detail of [
    "Anu Test",
    "9876543210",
    "anu@example.test",
    "Brown",
    "× 2",
    "₹5,100",
    "3-year warranty option",
    "Test House, Test Street",
    "Near test library",
    "Thrissur, Kerala — 680552",
    "UPI",
    "Please discuss installation.",
    "staff will confirm",
    "No payment has been made",
  ])
    expect(message).toContain(detail);
  await expect(page).toHaveURL(/order\/confirmation/);
  await expect(
    page.getByRole("heading", { name: "Finish your order on WhatsApp." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open WhatsApp & send" }),
  ).toHaveAttribute("href", new RegExp(`wa\\.me/${defaultContactNumbers.orderNumber}`));
  const reference = await page.locator(".reference-box > strong").textContent();
  await page.goto("/track");
  await page.getByLabel("Request reference").fill(reference!);
  await page.getByRole("button", { name: "Find request" }).click();
  await expect(page.locator(".track-result")).toContainText("Prepared locally");
  await expect(page.locator(".track-result")).toContainText(
    "cannot determine whether this message has been sent or accepted",
  );
});

test("service enquiry prepares an honest handoff to customer care", async ({
  page,
}) => {
  await page.goto("/support?tab=service");
  await page.getByLabel("Full name").fill("Service Test");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("Product model / serial (if known)").fill("TEST-MODEL");
  await page.getByLabel("Town / city and PIN code").fill("Thrissur 680552");
  await page
    .getByLabel("Tell us about the issue")
    .fill("Please help diagnose a remote control issue.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Prepare service request" }).click();
  await expect(
    page.getByRole("link", { name: "Open WhatsApp & send" }),
  ).toHaveAttribute("href", new RegExp(`wa\\.me/${defaultContactNumbers.careNumber}`));
  await page.getByText("Preview the message you'll share").click();
  await expect(page.locator(".request-preview pre")).toContainText(
    "TEST-MODEL",
  );
  await expect(page.locator(".request-preview pre")).toContainText(
    "warranty eligibility",
  );
});

test("malformed persisted data cannot break the storefront or tracking", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("bc-cart", '{"unexpected":true}');
    localStorage.setItem("bc-compare", "null");
    localStorage.setItem("bc-requests", '{"unexpected":true}');
  });
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "A little space for something good." }),
  ).toBeVisible();
  await page.goto("/track");
  await page.getByLabel("Request reference").fill("UNKNOWN-REFERENCE");
  await page.getByRole("button", { name: "Find request" }).click();
  await expect(page.getByRole("status")).toContainText("No matching request");
});

test("mobile navigation and all public layouts fit a small screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page
    .locator(".main-nav")
    .getByRole("link", { name: "Our products" })
    .click();
  await expect(page).toHaveURL(/products/);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/products",
      "/product/base-model-2-year",
      "/cart",
      "/compare",
      "/support",
      "/support?tab=service",
      "/business",
      "/about",
      "/contact",
      "/track",
      "/policies/privacy",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBeTruthy();
    }
  }
});

test("home and checkout do not have serious automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const home = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    home.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Add Base model to bag" }).click();
  await page.goto("/checkout");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const checkout = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    checkout.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
