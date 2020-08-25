import { config } from 'dotenv';
import { createPool, Pool, PoolConfig } from 'mysql';
import { schedule } from 'node-cron';
import { launch } from 'puppeteer';

import { Article } from './article.model';
import { storeArticle } from './storage';


/** Only use .env files when running in dev mode */
if (!process.env.produtction) config();

export const mainPost = 'https://www.mainpost.de/anzeigen/suchen/immobilien/';
export const itemSpacer = '\n\n';

async function scrape(pool: Pool) {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto(mainPost);

    /** Items are text array of the html <article> node inner text. */
    const items: string[] = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('article'));
        return tds.map(td => (td as any).innerText);
    });

    const articles: Article[] = [];

    // Extract unique lines out of article
    items.forEach(item => {
        const lines: string[] = item.split(/\r\n|\n|\r/).filter(lines => !!lines.length);
        const uniqueLinesObject = {};
        lines.forEach(line => {
            if (!uniqueLinesObject[line]) uniqueLinesObject[line] = 1;
        });
        const uniqueLines: string[] = Object.keys(uniqueLinesObject);
        if (uniqueLines[0].match(/^[0-3]?[0-9].[0-3]?[0-9].(?:[0-9]{2})?[0-9]{2}$/)) {
            // Only real search results start with a date
            articles.push(new Article(uniqueLines[1], uniqueLines[0], uniqueLines[2]));
        }
    });

    /** Store articles */
    articles.forEach(article => storeArticle(article, pool));

    await browser.close();
}

const pool: Pool = createPool(<PoolConfig>{
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT
});

// Scrape every 5 minutes (https://crontab.guru is your best friend)
const interval = process.env.production ? '*/5 * * * *' : '* * * * *';
schedule(interval, () => scrape(pool));