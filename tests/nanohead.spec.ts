import { defaultContactNumbers } from '../shared/contacts';
import { test, expect } from '@playwright/test';

test('Nanohead standard and Wood are separate products with all six warranty prices', async ({ page }) => {
  await page.goto('/products?category=Nanohead%20model');
  await expect(page.locator('.product-card')).toHaveCount(2);
  const standard = page.locator('.product-card').filter({ has: page.getByRole('heading', { name: 'Nanohead model', exact: true }) });
  const wood = page.locator('.product-card').filter({ has: page.getByRole('heading', { name: 'Nanohead Wood model', exact: true }) });
  for (const colour of ['Black', 'Silver', 'White', 'Brown']) {
    await standard.getByRole('button', { name: `Nanohead model, ${colour}`, exact: true }).click();
    const image = standard.getByRole('img', { name: `Bright Copter Nanohead model ceiling fan in ${colour}`, exact: true });
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    await expect(image).toHaveAttribute('src', new RegExp(`nanohead/${colour.toLowerCase()}`));
  }
  await expect(standard.locator('.finish-dots button')).toHaveCount(4);
  await expect(wood.locator('.finish-dots')).toHaveCount(0);
  await expect(standard.getByRole('button', { name: 'Nanohead model, Ivory', exact: true })).toHaveCount(0);
  await expect(wood.getByRole('img')).toHaveAttribute('src', /nanohead\/wood/);
  for (const [years, normalPrice, woodPrice] of [[3, '₹3,350', '₹3,750'], [5, '₹3,650', '₹4,050'], [7, '₹4,000', '₹4,400']] as const) {
    await standard.getByRole('button', { name: `Choose ${years}-year warranty` }).click();
    await wood.getByRole('button', { name: `Choose ${years}-year warranty` }).click();
    await expect(standard.locator('.product-card-bottom')).toContainText(normalPrice);
    await expect(wood.locator('.product-card-bottom')).toContainText(woodPrice);
  }
  await wood.getByRole('link', { name: 'View Nanohead Wood model' }).click();
  await expect(page).toHaveURL(/nanohead-wood-model-7-year/);
  await expect(page.locator('.detail-price')).toContainText('₹4,400');
  await expect(page.locator('.detail-copy .fixed-finish')).toHaveText('Finish: Wood');
  await expect(page.locator('.detail-copy .finish-picker')).toHaveCount(0);
  await expect(page.locator('.detail-copy .warranty-picker button')).toHaveCount(3);
});

test('normal Nanohead never accepts Wood as a cheaper colour selection', async ({ page }) => {
  await page.goto('/product/nanohead-model-3-year?finish=Wood');
  await expect(page.locator('.detail-image img')).toHaveAccessibleName('Bright Copter Nanohead model ceiling fan in Black');
  await expect(page.locator('.detail-copy').getByRole('button', { name: 'Choose Wood', exact: true })).toHaveCount(0);
  await page.goto('/product/nanohead-model-3-year?finish=Ivory');
  await expect(page.locator('.detail-image img')).toHaveAccessibleName('Bright Copter Nanohead model ceiling fan in Black');
  await page.goto('/product/nanohead-wood-model-3-year?finish=Brown');
  await expect(page.locator('.detail-image img')).toHaveAccessibleName('Bright Copter Nanohead Wood model ceiling fan in Wood');
  await expect(page.locator('.detail-price')).toContainText('₹3,750');
});

test('mixed Nanohead orders retain product, finish, warranty and exact prices through WhatsApp', async ({ page, context }) => {
  await context.route('https://wa.me/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Local handoff test</title>' }));
  await page.goto('/product/nanohead-model-5-year?finish=Silver');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('/product/nanohead-wood-model-7-year');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  // Changing warranty must retain the product family, Wood finish and quantity.
  await page.locator('.detail-copy').getByRole('button', { name: 'Choose 5-year warranty' }).click();
  await expect(page.locator('.detail-price')).toContainText('₹4,050');
  await expect(page.locator('.quantity-control > span')).toHaveText('2');
  await page.locator('.detail-copy').getByRole('button', { name: 'Choose 7-year warranty' }).click();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('/cart');
  await expect(page.locator('.cart-item')).toHaveCount(2);
  await expect(page.locator('.cart-item').first()).toContainText('Silver · 5-year warranty');
  await expect(page.locator('.cart-item').last()).toContainText('Wood · 7-year warranty');
  await expect(page.locator('.summary-total')).toContainText('₹12,450');
  await page.reload();
  await expect(page.locator('.summary-total')).toContainText('₹12,450');
  await page.getByRole('link', { name: 'Continue to checkout' }).click();
  await page.getByLabel('Full name').fill('Nano Test');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('House / building, street and locality').fill('Test House, Parappur');
  await page.getByLabel('Town / city').fill('Thrissur');
  await page.getByLabel('PIN code').fill('680552');
  await page.getByRole('radio', { name: 'UPI', exact: true }).check();
  await page.getByRole('button', { name: 'Review your order' }).click();
  const opened = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Place order via WhatsApp' }).click();
  const popup = await opened;
  await popup.waitForLoadState();
  const url = new URL(popup.url());
  expect(url.pathname).toBe(`/${defaultContactNumbers.orderNumber}`);
  const message = url.searchParams.get('text')!;
  for (const line of ['Nanohead model — Silver', '5-year warranty option × 1', 'Unit price: ₹3,650', 'Nanohead Wood model — Wood', '7-year warranty option × 2', 'Unit price: ₹4,400', '₹8,800', '₹12,450', 'Nano Test', '680552', 'UPI', 'staff will confirm']) expect(message).toContain(line);
});

test('Nanohead cards and all three warranty choices fit phone screens', async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/products?category=Nanohead%20model', '/product/nanohead-model-7-year', '/product/nanohead-wood-model-7-year', '/compare', '/support?tab=warranty', '/policies/warranty']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBeTruthy();
    }
  }
});
