const puppeteer = require("puppeteer");
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const extractEmails = (text) => {
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g;
    return text.match(emailRegex) || [];
};

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide a URL as an argument.');
        process.exit(1);
    }

    const url = args[0];
    try {
        const browser = await puppeteer.launch({ headless: true, timeout: 60000 });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const html = await page.content();

        const extractLinks = await page.evaluate(() => {
            const linkTags = Array.from(document.querySelectorAll('a'));
            return linkTags.map(tag => tag.href);
        });

        let allImages = [];
        let allEmails = [];
        for (const link of extractLinks) {
            try {
                const newPage = await browser.newPage();
                await newPage.goto(link, { waitUntil: 'networkidle2' });

                const extractImages = await newPage.evaluate(() => {
                    const imageTags = Array.from(document.querySelectorAll('img'));
                    return imageTags.map(tag => tag.src);
                });

                const pageText = await newPage.evaluate(() => document.body.innerText);
                const emails = extractEmails(pageText);

                allImages = allImages.concat(extractImages);
                allEmails = allEmails.concat(emails);

                await newPage.close();
            } catch (error) {
                console.error(`Error extracting data from ${link}:`, error);
            }
        }

        const absoluteLinks = extractLinks.map(link => {
            try {
                return new URL(link, url).href;
            } catch (error) {
                console.warn(`Invalid URL: ${link}`);
                return link;
            }
        });

        const uniqueLinks = [...new Set(absoluteLinks)].sort();
        const uniqueImages = [...new Set(allImages)].sort();
        const uniqueEmails = [...new Set(allEmails)].sort();

        await writeFile('page.html', html);
        await writeFile('links.txt', uniqueLinks.join('\n'));
        await writeFile('images.txt', uniqueImages.join('\n'));
        await writeFile('emails.txt', uniqueEmails.join('\n'));

        await browser.close();
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

main();
