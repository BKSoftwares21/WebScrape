const  puppeteer = require("puppeteer");
const fs =require('fs');
const { promisify} = require('util');
const writeFile = promisify(fs.writeFile);

/*
async function MovieScraper(url){
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto(url)
    await page.screenshot({path: 'screenshot.png'})
    await browser.close()

    const [elem] = await page.$x('//*[@id="pt-cv-content-views-script-js"]')
    const text = await elem.getProperty('text')
    const textContent = await text.jsonValue();

    console.log({'textContent'}); 
}

MovieScraper('https://pahe.ink/')
*/

const url = "https://pahe.ink/";

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    

    const allArticles = await page.evaluate(() => {
        const articles = document.querySelectorAll('article');

        return Array.from(articles).slice(0, 12).map((article) => {
            const movieTitle = article.querySelector('h2').innerText;
            const thumbnail = article.querySelector('a').href;
            const description = article.querySelector('p').innerText;
            return { movieTitle, thumbnail, description};
        });
    });
    await writeFile('output.html', html);

    console.log(allArticles);
    browser.close();
}

main();
    