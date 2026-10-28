import {test,expect} from '@playwright/test';

test('all four supplied colours display real photos and both warranty prices',async({page})=>{
 await page.goto('/products?category=Base%20model');
 const card=page.locator('.product-card');
 await expect(card).toHaveCount(1);
 for(const colour of ['Black','White','Brown','Ivory']){
  await card.getByRole('button',{name:`Base model, ${colour}`,exact:true}).click();
  const photo=card.getByRole('img',{name:`Bright Copter Base model ceiling fan in ${colour}`,exact:true});
  await expect.poll(()=>photo.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();
  await expect(photo).toHaveAttribute('src',new RegExp(colour.toLowerCase()));
 }
 await card.getByRole('button',{name:'Choose 3-year warranty'}).click();
 await expect(card.locator('.product-card-bottom')).toContainText('₹2,550');
 await card.getByRole('link',{name:'View Base model'}).click();
 await expect(page.getByRole('button',{name:'Choose Ivory'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.detail-copy').getByRole('button',{name:'Choose 3-year warranty'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Increase quantity'}).click();
 await page.getByRole('button',{name:'Choose 2-year warranty'}).click();
 await expect(page.locator('.detail-price')).toContainText('₹2,350');
 await expect(page.locator('.quantity-control > span')).toHaveText('2');
 await expect(page.getByRole('button',{name:'Choose Ivory'})).toHaveAttribute('aria-pressed','true');
});

test('the same colour with different warranties remains two separately priced bag lines',async({page})=>{
 await page.goto('/product/base-model-2-year?finish=White');
 await page.getByRole('button',{name:'Add to bag',exact:true}).click();
 await page.locator('.detail-copy').getByRole('button',{name:'Choose 3-year warranty'}).click();
 await page.getByRole('button',{name:'Add to bag',exact:true}).click();
 await page.goto('/cart');
 await expect(page.locator('.cart-item')).toHaveCount(2);
 await expect(page.locator('.cart-item').first()).toContainText('White · 2-year warranty');
 await expect(page.locator('.cart-item').last()).toContainText('White · 3-year warranty');
 await expect(page.locator('.summary-total')).toContainText('₹4,900');
 await page.reload();
 await expect(page.locator('.summary-total')).toContainText('₹4,900');
 await page.getByRole('button',{name:'Remove Base model in White, 2-year warranty',exact:true}).click();
 await expect(page.locator('.cart-item')).toHaveCount(1);
 await expect(page.locator('.summary-total')).toContainText('₹2,550');
 await page.goto('/checkout');
 await expect(page.locator('.checkout-item')).toContainText('White · 3-year warranty');
});

test('saved sample catalogue items are discarded when opening the real catalogue',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  localStorage.setItem('bc-cart',JSON.stringify([{id:'bldc-essential',finish:'Pearl white',quantity:1}]));
  localStorage.setItem('bc-compare',JSON.stringify(['bldc-essential','bldc-signature']));
 });
 await page.reload();
 await expect(page.getByRole('link',{name:'Shopping bag, 0 items'})).toBeVisible();
 await expect(page.locator('.compare-floating')).toHaveCount(0);
});
