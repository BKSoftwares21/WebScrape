const puppeteer = require("puppeteer");
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide a URL as an argument.');
        process.exit(1);
    }

    const url = args[0];
    try {
        const browser = await puppeteer.launch({ headless: true, timeout:60000 });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const html = await page.content();

        const extractLinks = await page.evaluate(() => {
            const linkTags = Array.from(document.querySelectorAll('a'));
            return linkTags.map(tag => tag.href);
        });
        
        let allImages = []
        for (const link in extractLinks){
            try{
                const newPage = await browser.newPage();
                await newPage.goto(link, {waitUntil: 'networkidle2'});

                const extractImages = await page.evaluate(() => {
                    const imageTags = Array.from(document.querySelectorAll('img'));
                    return imageTags.map(tag => tag.src);
                });

                allImages = allImages.concat(extractImages);
                await newPage.close();
            }
            catch(error){
                await console.error('images.txt', allImages.join('\n'));
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

        const sortLinks = [...new Set(absoluteLinks)].sort();
        allImages = [...new Set(allImages)].sort();
        await writeFile('page.html', html); 
        await writeFile('links.txt', sortLinks.join('\n'));
        await writeFile('images.txt', allImages.join('\n'));

        await browser.close();
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

main();
