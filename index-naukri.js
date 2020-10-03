// node-pachong/index.js
/**
 * 使用Node.js做爬虫实战
 * author: justbecoder <justbecoder@aliyun.com>
 */

// 引入需要的工具包
const puppeteer = require('puppeteer');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'react-js-jobs';
var BASE_URL = 'https://www.naukri.com/' + keywords + '-0?industryTypeId=25&jobAge=15';
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

let jobs = [];

// 等一下
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

// 爬所有圖片網址
;(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
    })
    const page = await browser.newPage()
    await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: 0
    }) // your url here

    // Get the height of the rendered page
    const bodyHandle = await page.$('body')
    const { height } = await bodyHandle.boundingBox()
    await bodyHandle.dispose()
    
    const elements = await page.$$('.fleft.grey-text.mr-5.fs12');
    const searchResultText = await (await elements[0].getProperty('innerHTML')).jsonValue();
    console.log('searchResultText: ', searchResultText);
    // const jobNumber = parseInt(searchResultText.replace('1 - 20 of ', ''));
    const jobNumber = 50
    var currentJobCount = 0;
    console.log('jobNumber: ', jobNumber);
    var result;

    while (currentJobCount < jobNumber) {

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

        console.log('result.length: ', result.length);
        BASE_URL = BASE_URL.replace('-' + currentJobCount.toString(), '-' + (currentJobCount + 1).toString());
        currentJobCount = currentJobCount + 1;
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle2',
            timeout: 0
        }) // your url here
    }

    // while (await page.evaluate(() => {
    //     Array.from(document.querySelectorAll('.btn-next-prev')).length !== 0;
    // })) {
    //     console.log('next page exists');
    // }
    
    console.log('result.length: ', result.length);
    console.log('result[0]: ', result[0]);

    if (result.length !== 0) {
        console.log('result.length: ', result.length);
        for (let j = 0; j < result.length; j++) {
            await page.goto(result[j].link, {
                waitUntil: 'networkidle2',
                timeout: 0
            }) // your url here

            const e_result = await getJobDetail(page, result, j);

            result[j].description = e_result;

            if (j === result.length - 1) {
                break;
            }
        }
    }
    
    console.log('result: ', result);
    // console.log('result[0]: ', result[0]);
    
    var file = path.join(__dirname, 'naukri.json'); 
    var content = JSON.stringify(result);
    
    fs.writeFile(file, content, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('文件创建成功，地址：' + file);
    });

    await browser.close();
})()

async function getJobDetail(page) {
    console.log('getJobDetail is triggered');
    return await page.evaluate(() => {
        const description = Array.from(document.querySelectorAll('section.job-desc')).map(p => p.innerHTML)[0];
        console.log('description: ', description);
        // result[index].description = description;
        // console.log('description: ', description);
        return description;
    })
}

async function getJobInfo(page) {

    // get all jobs in the current page START
    async function infos() {
        return await page.evaluate(() => {
            const jobTitles = Array.from(document.querySelectorAll('.jobTupleHeader .info.fleft .title.fw500.ellipsis'));
            // const companyNames = Array.from(document.querySelectorAll('div.job-tittle span.company-name a.under-link'));
            const companyNames = Array.from(document.querySelectorAll('.mt-7.companyInfo.subheading.lh16 .subTitle.ellipsis.fleft')).map(span => {
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
            const locations = Array.from(document.querySelectorAll('.fleft.grey-text.br2.placeHolderLi.location .ellipsis.fleft.fs12.lh16')).map(small => small.innerHTML);
            const times = Array.from(document.querySelectorAll('.jobTupleFooter.mt-20 .type.br2.fleft span.fleft.fw500')).filter(span => span.innerHTML.includes('Ago') || span.innerHTML.includes('Now') || span.innerHTML.includes('Today')).map(span => span.innerHTML);
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
                area: null, 
                country: 'India'
            }
            result.push(res);
            if (i === info.companyNames.length - 1) {
                break;
            }
        }
    }
    
    console.log('result.length: ', result.length);
    // get all jobs in the current page END 

    // check if next page exists START 
    await page.evaluate(() => {
        const length = Array.from(document.querySelectorAll('.btn-next-prev')).length !== 0;
        console.log('length: ', length);
    })
    // check if next page exists END

     return result;
}