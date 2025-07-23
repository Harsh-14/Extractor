const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/extract', async (req, res) => {
  const { url } = req.query;
//   const selector='story-content'
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // const title = await page.title();
    // const text = await page.evaluate(() => document.body.innerText);
    const content = await page.evaluate(() => {
      const element = document.querySelector('.story-content');
      return element ? element.innerText.trim() : 'Element not found';
    });

    pureContent = content
    .replace(/\n{2,}/g, '\n')           // Collapse multiple line breaks
    .replace(/[ \t]{2,}/g, ' ')          // Collapse extra spaces
    .replace(/\s*\n\s*/g, '\n')          // Clean surrounding whitespace around newlines
    .replace(/[^ -~\n]/g, '')            // Remove non-ASCII (optional, keeps basic English chars)
    .trim();

    await browser.close();
    // res.json({ url, title, text,content });
    res.json({ pureContent });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
