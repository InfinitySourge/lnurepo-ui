// Local, synthetic fixtures only; never contacts Microsoft or production API.
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const path = require('node:path');
const fs = require('node:fs');
async function main() {
  const output = path.resolve(process.argv[2] || '.visual-check');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
  const errors = [];
  for (const scenario of ['login', 'home', 'profile', '404', 'home-dark', 'profile-mobile']) {
    const context = await browser.newContext({
      viewport: scenario.endsWith('mobile') ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      colorScheme: scenario.includes('dark') ? 'dark' : 'light',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      // The anonymous fixture deliberately returns 401 during session detection.
      if (message.type() === 'error' && !(scenario === 'login' && message.text().includes('401'))) errors.push(message.text());
    });
    await page.route('https://api.lnurepo.info/**', async (route) => {
      const endpoint = new URL(route.request().url()).pathname;
      let data = null;
      let status = 200;
      if (scenario === 'login') status = 401;
      else if (endpoint === '/auth/me') data = { id: 'synthetic:user', name: 'Марко Студент', email: 'example@lnu.edu.ua' };
      else if (endpoint === '/api/profile' && !scenario.startsWith('profile')) {
        data = { first_name: 'Марко', last_name: 'Студент', role: 'student', faculty: 'Фізичний факультет', group: 'ФЗ-21' };
      }
      await route.fulfill({ status, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:4173', 'Access-Control-Allow-Credentials': 'true' },
        body: JSON.stringify(data) });
    });
    await page.goto('http://127.0.0.1:4173/' + (scenario === '404' ? 'missing-page' : ''));
    const heading = scenario === 'login' ? 'Вхід у систему' : scenario.startsWith('profile') ? 'Завершіть реєстрацію' : scenario === '404' ? 'Сторінку не знайдено' : 'База навчальних матеріалів ЛНУ';
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    await page.screenshot({ path: path.join(output, scenario + '.png'), fullPage: true });
    if (scenario === 'profile') {
      await page.getByLabel('Ім’я', { exact: true }).fill('123');
      await page.getByRole('button', { name: 'Зберегти профіль' }).click();
      await page.getByRole('dialog', { name: 'Перевірте дані профілю' }).waitFor();
      await page.screenshot({ path: path.join(output, 'validation.png'), fullPage: true });
      await page.getByRole('button', { name: 'Зрозуміло' }).click();
      await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'first_name');
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow: ' + scenario);
    await context.close();
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('6 layouts and validation dialog checked; no browser/CSP errors or horizontal overflow.');
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
