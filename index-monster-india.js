// node-pachong/index.js
/**
 * 使用Node.js做爬虫实战
 * author: justbecoder <justbecoder@aliyun.com>
 */

// 引入需要的工具包
const sp = require('superagent');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');
const path = require('path');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'programmer';
var BASE_URL = 'https://www.monsterindia.com/srp/results?start=0&sort=2&limit=100&query=' + keywords;
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

let jobs = [];
// 下載圖片
var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        request(uri)
            .pipe(fs.createWriteStream(__dirname + `/${filename}`))
            .on('close', function() {
                console.log('Finished Copy Images')
            })
    })
}

// 等一下
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

// 爬所有圖片網址
// ;(async () => {
//     const browser = await puppeteer.launch({
//         headless: false,
//         slowMo: 100,
//     })
//     const page = await browser.newPage()
//     await page.goto(BASE_URL, {
//         waitUntil: 'domcontentloaded',
//     }) // your url here

//     // Some extra delay to let images load
//     await wait(5000)

//     let jobCards = await page.evaluate(() => {
//         const jobCards = Array.from(document.querySelectorAll('div.card-panel.apply-panel.job-apply-card'));
//         return jobCards;
//     })

//     console.log('jobCards: ', jobCards);

//     jobCards.forEach((element, index) => {
//             console.log('element: ', element);
//             console.log('index: ', index);
//         }
//     )

//     // await browser.close()
// })()


// 爬所有圖片網址
;(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
    })
    const page = await browser.newPage()
    await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
    }) // your url here

    // Get the height of the rendered page
    const bodyHandle = await page.$('body')
    const { height } = await bodyHandle.boundingBox()
    await bodyHandle.dispose()
    
    const elements = await page.$$('.col-lg-3 .main-heading');
    const searchResultText = await (await elements[0].getProperty('innerHTML')).jsonValue();
    console.log('searchResultText: ', searchResultText);
    const jobNumber = parseInt(searchResultText.replace('Search Results - ', ''));
    var currentJobCount = 0;
    console.log('jobNumber: ', jobNumber);
    var result;

    while (currentJobCount < jobNumber  && currentJobCount < 9600) {

        // Scroll one viewport at a time, pausing to let content load
        // const viewportHeight = page.viewport().height
        // let viewportIncr = 0
        // while (viewportIncr + viewportHeight < height) {
        //     await page.evaluate(_viewportHeight => {
        //         window.scrollBy(0, _viewportHeight)
        //     }, viewportHeight)
        //     await wait(20)
        //     viewportIncr = viewportIncr + viewportHeight
        // }
    
        // // Scroll back to top
        // await page.evaluate(_ => {
        //     window.scrollTo(0, 0)
        // })
    
        // Some extra delay to let images load
        await wait(1000)
    
        if (!result) {
            result = await getJobInfo(page);
        }
        else {
            const result_n = await getJobInfo(page);
            result = result.concat(result_n);
        }

        BASE_URL = BASE_URL.replace('start=' + currentJobCount.toString(), 'start=' + (currentJobCount + 100).toString());
        currentJobCount = currentJobCount + 100;
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle2',
        }) // your url here
    }

    // while (await page.evaluate(() => {
    //     Array.from(document.querySelectorAll('.btn-next-prev')).length !== 0;
    // })) {
    //     console.log('next page exists');
    // }
    
    console.log('result.length: ', result.length);
    
    await browser.close();
})()

async function getJobInfo(page) {

    // get all jobs in the current page START
    async function infos() {
        return await page.evaluate(() => {
            const jobTitles = Array.from(document.querySelectorAll('div.job-tittle h3.medium a'));
            // const companyNames = Array.from(document.querySelectorAll('div.job-tittle span.company-name a.under-link'));
            const companyNames = Array.from(document.querySelectorAll('div.job-tittle span.company-name')).map(span => {
                if (span.firstChild) {
                    if (span.firstChild.innerHTML) {
                        return span.firstChild.innerHTML;
                    }
                    else {
                        return span.innerHTML;
                    }
                }
                else {
                    return 'Company Name Confidential';
                }
            });
            const locations = Array.from(document.querySelectorAll('span.loc small')).filter(small => !small.innerHTML.includes('<') && !small.innerHTML.includes('INR') && !small.innerHTML.includes('Not')).map(small => small.innerHTML.replace('\n                                ', '').replace('\n                            ', ''));
            const times = Array.from(document.querySelectorAll('span.posted')).filter(span => !span.innerHTML.includes('|')).map(time => time.innerHTML.replace('\n                Posted: ', '').replace('\n            ', ''));
            const links = jobTitles.map(a => a.href);
            const names = jobTitles.map(a => a.innerHTML);
            const res = {
                companyNames: companyNames, 
                locations: locations,
                times: times, 
                links: links,
                names: names,
            };
            // var nextPageBtns = Array.from(document.querySelectorAll('.btn-next-prev'));
            // var nextPageBtnIndex = nextPageBtns.findIndex(e => e.innerHTML.includes('Next'));
            // var nextPageExists = nextPageBtnIndex !== -1;
            // if (nextPageExists) {
            //     page.click(nextPageBtns[nextPageBtnIndex]);
            //     const jobTitles = Array.from(document.querySelectorAll('div.job-tittle h3.medium a'));
            //     // const companyNames = Array.from(document.querySelectorAll('div.job-tittle span.company-name a.under-link'));
            //     const companyNames = Array.from(document.querySelectorAll('div.job-tittle span.company-name')).map(span => {
            //         if (span.firstChild) {
            //             if (span.firstChild.innerHTML) {
            //                 return span.firstChild.innerHTML;
            //             }
            //             else {
            //                 return span.innerHTML;
            //             }
            //         }
            //         else {
            //             return 'Company Name Confidential';
            //         }
            //     });
            //     const locations = Array.from(document.querySelectorAll('span.loc small')).filter(small => !small.innerHTML.includes('<') && !small.innerHTML.includes('INR') && !small.innerHTML.includes('Not')).map(small => small.innerHTML.replace('\n                                ', '').replace('\n                            ', ''));
            //     const times = Array.from(document.querySelectorAll('span.posted')).filter(span => !span.innerHTML.includes('|')).map(time => time.innerHTML.replace('\n                Posted: ', '').replace('\n            ', ''));
            //     const links = jobTitles.map(a => a.href);
            //     const names = jobTitles.map(a => a.innerHTML);
            //     const res = {
            //         companyNames: companyNames, 
            //         locations: locations,
            //         times: times, 
            //         links: links,
            //         names: names,
            //     };
            //     var nextPageBtns = Array.from(document.querySelectorAll('.btn-next-prev'));
            //     var nextPageBtnIndex = nextPageBtns.findIndex(e => e.innerHTML.includes('Next'));
            //     var nextPageExists = nextPageBtnIndex !== -1;
            // }
            
            // return result;
            return res;
        })
    }

    const info = await infos();

    console.log('info: ', info);
    console.log('info.companyNames.length: ', info.companyNames.length);
    console.log('info.locations.length: ', info.locations.length);
    console.log('info.times.length: ', info.times.length);
    console.log('info.links.length: ', info.links.length);
    console.log('info.names.length: ', info.names.length);

    const result = [];
    const condition = 
    info.companyNames.length === 
    info.locations.length && 
    info.times.length === 
    info.links.length && 
    info.names.length === info.times.length && 
    info.companyNames.length === info.names.length;
    console.log('condition: ', condition);
    if (condition) {
        for (let i = 0; i < info.companyNames.length; i++) {
            const res = {
                link: info.links[i],
                name: info.names[i],
                companyName: info.companyNames[i], 
                time: info.times[i],
                location: info.locations[i],
                area: null
            }
            result.push(res);
            if (i === info.companyNames.length - 1) {
                break;
            }
        }
    }
    
    console.log('result: ', result);
    // get all jobs in the current page END 

    // check if next page exists START 
    await page.evaluate(() => {
        const length = Array.from(document.querySelectorAll('.btn-next-prev')).length !== 0;
        console.log('length: ', length);
    })
    // check if next page exists END

     return result;
}