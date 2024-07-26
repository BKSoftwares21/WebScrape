const puppeteer = require("puppeteer");
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const makeAbsoluteUrl = (baseUrl, relativeUrls) => {
    return relativeUrls.map(url => {
        try {
            return new URL(url, baseUrl).href;
        } catch (error) {
            // If URL is invalid, return the original URL
            return url;
        }
    });
};

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide a URL as an argument.');
        process.exit(1);
    }

    const url = args[0];
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until network is idle

        const html = await page.content();

        const extractLinks = await page.evaluate(() => {
            const linkTags = Array.from(document.querySelectorAll('a'));
            return linkTags.map(tag => tag.href);
        });

        const extractImages = await page.evaluate(() => {
            const imageTags = Array.from(document.querySelectorAll('img'));
            return imageTags.map(tag => tag.src);
        });

        // Convert URLs to absolute URLs
        const baseUrl = new URL(url);
        const absoluteLinks = makeAbsoluteUrl(baseUrl.href, extractLinks);
        const absoluteImages = makeAbsoluteUrl(baseUrl.href, extractImages);

        // De-duplicate and sort links and images
        const uniqueLinks = [...new Set(absoluteLinks)].sort();
        const uniqueImages = [...new Set(absoluteImages)].sort();

        console.log('Links:', uniqueLinks);
        console.log('Images:', uniqueImages);

        // Write the data to files
        await writeFile('links.json', JSON.stringify(uniqueLinks, null, 2));
        await writeFile('images.json', JSON.stringify(uniqueImages, null, 2));

        // Write images to separate files
        for (let i = 0; i < uniqueImages.length; i++) {
            const viewSource = await page.goto(uniqueImages[i]);
            await writeFile(`image_${i}.png`, await viewSource.buffer());
        }

        await browser.close();
    } catch (error) {
        console.error('Error during scraping:', error);
    }
};

main();
