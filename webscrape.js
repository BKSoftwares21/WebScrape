const  puppeteer = require("puppeteer");

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
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    const allArticles = await page.evaluate(() => {
        const article = document.querySelector('article');

        return Array.from(articles).slice(0, 3).map((article) => {
            const movieTitle = article.movieTquerySelector('h2').innerText;
            const thumbnail = article.querySelector('a').href;
            const description = article.querySelector('p').innerText;
            return { movieTitle, thumbnail, description};
        });
    });

    console.log(allArticles);
}

main();
    