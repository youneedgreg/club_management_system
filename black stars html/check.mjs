import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

await page.goto('http://localhost:8124/Black%20Stars%20-%20Offline.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// give react time to mount
await page.waitForSelector('.app', { timeout: 10000 });

const navLabels = await page.$$eval('.navlist .navitem span', els => els.map(e => e.textContent));
console.log('NAV labels:', navLabels);

// click Kitchen
const navItems = await page.$$('.navlist .navitem');
let found = {};
for (const item of navItems) {
  const text = await item.textContent();
  if (text.includes('Kitchen')) { await item.click(); found.kitchen = true; }
}
await page.waitForTimeout(500);
const kitchenH1 = await page.$eval('.page-h1', el => el.textContent);
console.log('Kitchen page title:', kitchenH1);
const kitchenCards = await page.$$eval('.canvas .cols4 .card', els => els.length);
console.log('Kitchen stat cards:', kitchenCards);

// click Suppliers (payables)
for (const item of await page.$$('.navlist .navitem')) {
  const text = await item.textContent();
  if (text.includes('Suppliers') || text.includes('Payable')) { await item.click(); found.suppliers = text; }
}
await page.waitForTimeout(500);
console.log('Suppliers page title:', await page.$eval('.page-h1', el => el.textContent));
console.log('Supplier rows:', await page.$$eval('.canvas .stack .li', els => els.length));

// click Staff
for (const item of await page.$$('.navlist .navitem')) {
  const text = await item.textContent();
  if (text.includes('Staff')) { await item.click(); found.staff = text; }
}
await page.waitForTimeout(500);
console.log('Staff page title:', await page.$eval('.page-h1', el => el.textContent));
const segOptions = await page.$$eval('.canvas .seg button, .canvas [class*="seg"] button', els => els.map(e => e.textContent));
console.log('Staff tabs:', segOptions);

// click Permanent tab
for (const btn of await page.$$('.canvas button')) {
  const text = await btn.textContent();
  if (text.trim() === 'Permanent' || text.includes('Permanent')) { await btn.click(); break; }
}
await page.waitForTimeout(500);
console.log('Permanent rows:', await page.$$eval('.canvas table tbody tr, .canvas .stack .li', els => els.length));

// click Casuals tab
for (const btn of await page.$$('.canvas button')) {
  const text = await btn.textContent();
  if (text.includes('Casual')) { await btn.click(); break; }
}
await page.waitForTimeout(500);
console.log('Casuals page contains POS feed text:', (await page.content()).includes('POS'));

console.log('Found nav matches:', found);
console.log('Console/page errors:', errors);

await browser.close();
