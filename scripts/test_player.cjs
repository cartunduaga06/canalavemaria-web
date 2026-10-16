// Run against the actual Jekyll output. Remote requests are intercepted.
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '_site');
const files = fs.readdirSync(root, { recursive: true }).filter(
  p => p.endsWith('index.html') && fs.readFileSync(path.join(root, p), 'utf8').includes('data-embed='));
assert.ok(files.length > 0, 'No generated video pages found');
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' :
    file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  let scenarios = 0;
  try {
    for (const width of [390, 1440]) {
      for (const javaScriptEnabled of [true, false]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled });
        const page = await context.newPage();
        let requests = [];
        await page.route('**/*', async route => {
          const url = route.request().url();
          if (url.startsWith(base)) return route.continue();
          requests.push(url);
          if (url.includes('i.ytimg.com/')) return route.fulfill({
            contentType: 'image/png', body: Buffer.from(
              'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4xkAAAAASUVORK5CYII=', 'base64')
          });
          return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>External request intercepted</title>' });
        });
        for (const file of files) {
          requests = [];
          const errors = [];
          const onError = error => errors.push(error.message);
          page.on('pageerror', onError);
          await page.goto(base + '/' + file.replace(/index.html$/, ''), { waitUntil: 'networkidle' });
          assert.equal(await page.locator('iframe').count(), 0, file);
          assert.ok(requests.some(url => url.startsWith('https://i.ytimg.com/')), file);
          assert.ok(!requests.some(url => /youtube(?:-nocookie)?\.com/.test(url)), file);
          const link = page.locator('a.reproductor');
          const href = await link.getAttribute('href');
          const embed = await link.getAttribute('data-embed');
          assert.match(href, /^https:\/\/www.youtube.com\/(watch\?v=|shorts\/)[\w-]{11}$/);
          const image = await link.locator('img').getAttribute('src');
          assert.match(image, /^https:\/\/i.ytimg.com\/vi\/[\w-]{11}\/hqdefault.jpg$/);
          assert.ok(await link.locator('img').getAttribute('alt'));
          const box = await link.boundingBox();
          assert.ok(box.width <= width && box.width > 0, file);
          if (javaScriptEnabled) {
            await link.click();
            await page.locator('iframe.video-embed').waitFor();
            assert.equal(await page.locator('iframe').getAttribute('src'), embed, file);
            assert.equal(await page.locator('iframe').getAttribute('title'), await page.locator('h1').innerText());
            assert.equal(await page.locator('.reproductor__nota').count(), 0);
            assert.equal(await page.locator('a.reproductor').count(), 0);
            assert.equal(await page.evaluate(() => document.activeElement.tagName), 'IFRAME');
          } else {
            await link.click();
            await page.waitForURL(href);
            assert.ok(requests.includes(href), file);
          }
          assert.deepEqual(errors, [], file);
          page.off('pageerror', onError);
          scenarios++;
        }
        await context.close();
      }
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.route('**/*', route => route.request().url().startsWith(base) ?
        route.continue() : route.fulfill({ body: '' }));
      await page.goto(base + '/' + files[0].replace(/index.html$/, ''));
      await page.locator('a.reproductor').focus();
      await page.keyboard.press('Enter');
      await page.locator('iframe.video-embed').waitFor();
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'IFRAME');
      await context.close();
      scenarios++;
    }
    console.log(JSON.stringify({ result: 'PASS', generatedVideoPages: files.length,
      viewports: [390, 1440], scenarios, externalRequests: 'intercepted; no real YouTube playback' }));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
