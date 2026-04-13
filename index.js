const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/screenshot', async (req, res) => {
  const { urls } = req.body; // expects { "urls": ["https://...", ...] }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const url of urls) {
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 800 });
    await desktopPage.goto(url, { waitUntil: 'networkidle2' });
    const desktop = await desktopPage.screenshot({ encoding: 'base64' });
    await desktopPage.close();

    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844 });
    await mobilePage.goto(url, { waitUntil: 'networkidle2' });
    const mobile = await mobilePage.screenshot({ encoding: 'base64' });
    await mobilePage.close();

    results.push({ url, desktop, mobile });
  }

  await browser.close();
  res.json({ results });
});

app.listen(3000, () => console.log('Screenshot service running on port 3000'));