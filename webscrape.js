const  puppeteer = require("puppeteer");
const fs =require('fs');
const { promisify} = require('util');
const writeFile = promisify(fs.writeFile);


const url = "https://pahe.ink/";

const main = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();

    const allArticles = await page.evaluate(() => {
        const article = document.querySelector('article');

        return Array.from(articles).slice(0, 3).map((article) => {
            const movieTitle = article.movieTquerySelector('h2').innerText;
            const thumbnail = article.querySelector('a').href;
            const description = article.querySelector('p').innerText;
            return { movieTitle, thumbnail, description};
        });
    });
    await writeFile('output.html', html);

    console.log(allArticles);
}

main();
    