const  puppeteer = require("puppeteer");
const fs =require('fs');
const { promisify} = require('util');
const writeFile = promisify(fs.writeFile);


const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide a URL as an argument.');
        process.exit(1);
    }

    const url = args[0];
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.content();

        const allArticles = await page.evaluate(() => {
            const articles = document.querySelectorAll('article');

            return Array.from(articles).slice(0, 3).map((article) => {
                const movieTitle = article.querySelector('h2') ? article.querySelector('h2').innerText : '';
                const thumbnail = article.querySelector('a') ? article.querySelector('a').href : '';
                const description = article.querySelector('p') ? article.querySelector('p').innerText : '';
                return { movieTitle, thumbnail, description};
            });
        });
        await writeFile('output.html', html);
        console.log(allArticles);
    
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

main();
    