import { test, expect } from "@playwright/test";

test("finish previews and product details keep the customer's selection", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Preview Brown" }).click();
  await expect(page.locator(".hero-finish-panel strong")).toHaveText("Brown");
  await expect(page.locator(".hero-render").getByRole("img")).toHaveAccessibleName(
    "Bright Copter Base model ceiling fan in Brown",
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    const photo = (await page.locator('.hero-render').boundingBox())!;
    const stage = (await page.locator('.hero-stage').boundingBox())!;
    const finishes = (await page.locator('.hero-finish-panel').boundingBox())!;
    const link = (await page.locator('.hero-product-link').boundingBox())!;
    expect(photo.height).toBeGreaterThan(140);
    expect(stage.x).toBeGreaterThanOrEqual(0);
    expect(stage.x + stage.width).toBeLessThanOrEqual(width);
    expect(photo.y + photo.height).toBeLessThanOrEqual(finishes.y);
    expect(finishes.y + finishes.height).toBeLessThanOrEqual(link.y);
    for (const swatch of await page.locator('.hero-swatches button').all()) {
      const box = (await swatch.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
  await expect(page.getByRole("link", { name: "Shopping bag, 0 items" })).toBeVisible();
  const card = page.locator(".product-card").filter({ hasText: "Base model" });
  await card.getByRole("button", { name: "Base model, Ivory", exact: true }).click();
  await card.getByRole("link", { name: "View Base model" }).click();
  await expect(page.getByRole("button", { name: "Choose Ivory" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Specifications" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Ivory");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Delivery & installation" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("A clear plan for getting it home.");
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "Overview", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("phone checkout stays readable and returns focus when editing the review", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/product/base-model-2-year");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.goto("/checkout");
  await expect(page.getByLabel("Full name")).toHaveCSS("font-size", "16px");
  await expect(page.locator('.checkout-progress [aria-current="step"]')).toContainText("Details");
  await page.getByLabel("Full name").fill("Maya Test");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("House / building, street and locality").fill("Test House, Parappur");
  await page.getByLabel("Town / city").fill("Thrissur");
  await page.getByLabel("PIN code").fill("680552");
  await page.getByRole("radio", { name: "Bank transfer", exact: true }).check();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole("button", { name: "Review your order" }).click();
  await expect(page.locator('.checkout-progress [aria-current="step"]')).toContainText("Review");
  await expect(page.getByRole("heading", { name: "Everything look right?" })).toBeFocused();
  await expect(page.locator(".review-card").last()).toContainText("Bank transfer");
  const handoff = page.getByRole("button", { name: "Place order via WhatsApp" });
  await expect(handoff).toBeVisible();
  expect((await handoff.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByRole("heading", { name: "Your delivery details" })).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveValue("Maya Test");
  await expect(page.getByRole("radio", { name: "Bank transfer" })).toBeChecked();
});
