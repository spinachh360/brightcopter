import {test,expect} from '@playwright/test';

test('footer opens dedicated semantic returns and terms pages and unknown routes use the custom 404',async({page})=>{
 await page.goto('/');
 const footer=page.locator('.site-footer');
 await footer.getByRole('link',{name:'Returns & refunds',exact:true}).click();
 await expect(page).toHaveURL(/return-policy$/);
 await expect(page).toHaveTitle('Returns, replacements & refunds | Bright Copter');
 await expect(page.getByRole('heading',{name:'Returns, replacements & refunds',exact:true})).toBeVisible();
 await expect(page.locator('article > section')).toHaveCount(9);
 await page.getByRole('navigation',{name:'On this page'}).getByRole('link',{name:'7. Approved refunds'}).click();
 await expect(page.getByRole('heading',{name:'7. Approved refunds'})).toBeFocused();
 await footer.getByRole('link',{name:'Terms & conditions',exact:true}).click();
 await expect(page.locator('article > section')).toHaveCount(11);
 await expect(page.getByRole('heading',{name:'Terms & conditions',exact:true})).toBeVisible();
 await page.goto('/policies/terms');await expect(page).toHaveURL(/terms-and-conditions$/);
 await page.goto('/this-page-does-not-exist');
 await expect(page.getByLabel('Error 404')).toBeVisible();
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
 await page.getByRole('link',{name:'Explore ceiling fans'}).click();await expect(page).toHaveURL(/products$/);
});
async function fillService(page: import('@playwright/test').Page) {
 await page.goto('/support?tab=service');
 await page.getByLabel('Full name').fill('Service Test');
 await page.getByLabel('Mobile number').fill('9876543210');
 await page.getByLabel('Town / city and PIN code').fill('Thrissur 680552');
 await page.getByLabel('Tell us about the issue').fill('Please assess the remote.');
 await page.getByRole('checkbox').check();
}
test('honeypot and browser repeat limits show errors without losing customer details',async({page})=>{
 await fillService(page);
 await page.locator('input[name="website"]').evaluate((input:HTMLInputElement)=>input.value='spam.example');
 await page.getByRole('button',{name:'Prepare service request'}).click();
 await expect(page.getByRole('alert')).toContainText('could not prepare');
 await expect(page.getByLabel('Full name')).toHaveValue('Service Test');
 await page.locator('input[name="website"]').evaluate((input:HTMLInputElement)=>input.value='');
 await page.evaluate(()=>sessionStorage.setItem('bc-limit-service',JSON.stringify([Date.now(),Date.now(),Date.now()])));
 await page.getByRole('button',{name:'Prepare service request'}).click();
 await expect(page.getByRole('alert')).toContainText('wait five minutes');
 await expect(page).toHaveURL(/support\?tab=service/);
});
test('request previews escape markup and expired personal details are removed',async({page})=>{
 await fillService(page);
 const text='<img src=x onerror="window.unwanted=true">';
 await page.getByLabel('Tell us about the issue').fill(text);
 await page.getByRole('button',{name:'Prepare service request'}).click();
 await page.getByText("Preview the message you'll share").click();
 await expect(page.locator('.request-preview pre')).toContainText(text);
 await expect(page.locator('.request-preview pre img')).toHaveCount(0);
 expect(await page.evaluate(()=>Object.hasOwn(window,'unwanted'))).toBeFalsy();
 await page.evaluate(()=>localStorage.setItem('bc-requests',JSON.stringify([{reference:'BC-ORD-ABCD1234',type:'order',name:'Expired customer',message:'Old address',date:new Date(Date.now()-9*86400000).toISOString()}])));
 await page.goto('/track');await page.getByLabel('Request reference').fill('BC-ORD-ABCD1234');await page.getByRole('button',{name:'Find request'}).click();
 await expect(page.getByRole('status')).toContainText('No matching request');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('bc-requests')!))).toEqual([]);
});
test('unexpected rendering errors show recovery actions without exposing the exception',async({page})=>{
 await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=function(){throw new Error('PRIVATE_DIAGNOSTIC_DO_NOT_DISPLAY');};});
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Something interrupted the page.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reload the page'})).toBeVisible();
 await expect(page.locator('body')).not.toContainText('PRIVATE_DIAGNOSTIC_DO_NOT_DISPLAY');
});
test('policy pages fit phone screens and no optional analytics cookies are set',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  for(const route of ['/return-policy','/terms-and-conditions','/policies/privacy','/unknown']){
   await page.goto(route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBeTruthy();
  }
 }
 expect(await page.context().cookies()).toEqual([]);
});
