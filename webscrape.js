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

        const extractLinks = await page.evaluate(() => {
            const linkTags = Array.from(document.querySelectorAll('a'));
            return linkTags.map(tag => tag.href);
        })

        const extractImages = await page.evaluate(() => {
            const imageTags = Array.from(document.querySelectorAll('img'));
            return imageTags.map(tag => tag.src);
        })

        console.log('Links:', extractLinks);
        console.log('Images:', extractImages);
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

main();
    