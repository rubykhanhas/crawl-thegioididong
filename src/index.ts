import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { ItemSchema } from "./models";
import { ITEM_HREF } from "./query";
import { saveToJSON } from "./save";
dotenv.config();

const BASEURL_TGDD = process.env.BASEURL_TGDD?.toString() || "https://www.thegioididong.com";

let laptops: ItemSchema[] = [];
let mobiles: ItemSchema[] = [];

const crawlByCategory = async (
    url: string,
    $browser: puppeteer.Browser,
    category: string,
    pagesOfItem = 0,
    collection: ItemSchema[]
) => {
    const $page = await $browser.newPage();
    await $page.goto(BASEURL_TGDD + "/" + url);
    for (let i = 1; i <= pagesOfItem; i++) await viewMore($page);
    const hrefs = await getHref($page);
    for (let i = 0; i < hrefs.length; i++) {
        await getItemByUrl(`${BASEURL_TGDD + hrefs[i]}`, $browser, category, collection);
    }
    // console.log(res);
    await $page.close();
};
/* Get HREF link */
const getHref = async ($page: puppeteer.Page) => {
    const res = await $page.$$eval(ITEM_HREF, (tags) => tags.map((tag) => tag.getAttribute("href")));
    return res;
};
/* Get Data from new page */
const getItemByUrl = async (
    itemUrl: string,
    $browser: puppeteer.Browser,
    category: string,
    collection: ItemSchema[]
) => {
    const $page = await $browser.newPage();
    await $page.goto(itemUrl);
    try {
        // Query DOM
        const images = await $page.$eval("#normalproduct .picture", (tag) => {
            const imgs = tag.getElementsByTagName("img");
            const res = Array.from(imgs).map((img) => img.getAttribute("src") || "");
            return res;
        });
        const title = (await $page.$eval("h1[data-p='3']", (tag) => tag.textContent)) || "";
        const price =
            (await $page.$eval(".area_price > strong", (tag) => {
                if (tag.textContent) {
                    const VND_TO_USD_RATE = 0.000043;
                    return parseFloat(
                        (parseFloat(tag.textContent.slice(0, -1).replace(/\./gim, "")) * VND_TO_USD_RATE).toFixed(2)
                    );
                }
            })) || 0;
        const shortDes = await $page.$eval("ul[class='parameter ']", (tag) => {
            return Array.from(tag.children)
                .map((li) => li.textContent?.replace(/:/, ": "))
                .join("\n");
        });
        const longDes = await $page.$eval("article[class='area_article ']", (tag) => {
            const textTags = tag.querySelectorAll("p, h2, h3");
            const strArr = Array.from(textTags).map((item) => item.textContent);
            return strArr.join("\n");
        });
        const sold = Math.floor(Math.random() * 200);
        const remain = Math.floor(Math.random() * 100);
        const sales = Math.floor(Math.random() * 4) * 5;
        const salePrice = price ? price - (sales / 100) * price : 0;

        const _item = {
            images,
            title,
            price,
            shortDes,
            longDes,
            sold,
            remain,
            sales,
            salePrice,
            category,
        };
        collection.push(_item);
        await $page.close();
    } catch (err) {
        console.log(`${Error + itemUrl}`);
        $page.close();
        return;
    }
};

const viewMore = async ($page: puppeteer.Page) => {
    await $page.waitForSelector("a.viewmore");
    await $page.click("a.viewmore");
    await $page.waitForTimeout(200);
};

(async function main() {
    try {
        //set {headless : false} to debug
        const $browser = await puppeteer.launch({ headless: true });
        await crawlByCategory("laptop", $browser, "laptop",4, laptops);
        await crawlByCategory("dtdd", $browser, "mobile phone", 4, mobiles);
        await $browser.close();

        const data = laptops.concat(mobiles);
        saveToJSON(data, "data.json");
    } catch (err) {
        console.log(`=======ERROR=======\n ${err}`);
    }
})();
