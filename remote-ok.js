// node-pachong/index.js
/**
 * 使用Node.js做爬虫实战
 * author: justbecoder <justbecoder@aliyun.com>
 */

// 引入需要的工具包
const sp = require('superagent');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');
const request = require('request');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'node%20js';
const BASE_URL = 'https://au.indeed.com/jobs?q=' + keywords + '&fromage=14';
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

let jobs = [];
// 1. 发送请求，获取HTML字符串
(async () => {

    // await pageLoader(BASE_URL);
    
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
    })
    const page = await browser.newPage();

    var file = path.join(__dirname, 'remote-ok.json'); 
    
    await fs.readFile(file, async function(err, data) {
        if (err) {
            return console.log(err);
        }
        let array = JSON.parse(data);
        console.log('array: ', array);
        array.splice(0, 1);
        jobs = array;
        for (let i = 0; i < jobs.length; i++) {
            console.log('i: ', i);
            sleep.sleep(2);
            // await jobLoader(jobs[i].url, i);
            await page.goto(jobs[i].url, {
                waitUntil: 'networkidle2',
                timeout: 0
            }) // your url here
        
            const description = await getJobDetail(page);

            jobs[i].description = description;

            console.log('jobs[i].description: ', jobs[i].description);

            if (i === jobs.length - 1) {
                break;
            }
        }

        console.log('jobs: ', jobs);

        console.log('jobs.length: ', jobs.length);

        var file = path.join(__dirname, 'remote-ok-new.json'); 
        var content = JSON.stringify(jobs);
        
        fs.writeFile(file, content, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log('文件创建成功，地址：' + file);
        });

        await browser.close();
        
    });
})()

async function getJobDetail(page) {
    console.log('getJobDetail is triggered');
    return await page.evaluate(() => {
        const description = Array.from(document.querySelectorAll('div.markdown')).map(p => p.innerHTML)[0];
        // jobs[i].description = description;
        console.log('description: ', description);
        return description;
    })
}

async function pageLoader(url) {

    var file = path.join(__dirname, 'remote-ok.json'); 
    
    fs.readFile(file, async function(err, data) {
        if (err) {
            return console.log(err);
        }
        let array = JSON.parse(data);
        console.log('array: ', array);
        jobs = array;
        for (let i = 0; i < jobs.length; i++) {
            console.log('i: ', i);
            sleep.sleep(2);
            await jobLoader(jobs[i].url, i);
            if (i === jobs.length - 1) {
                break;
            }
        }
        // console.log('文件创建成功，地址：' + file);
    });

    return jobs;

    // let html = await sp.get(url);
  
    // // 2. 将字符串导入，使用cheerio获取元素
    // let $ = cheerio.load(html.text);
    
    // // 3. 获取指定的元素
    // $('#resultsCol div.jobsearch-SerpJobCard').each(function () {
    //     console.log('element caught');
    //     const info = getJobInfo($, this);
    //     if (info !== null) {
    //         jobs.push(info);
    //     }
    // })

    // if (
    //     $('.pagination-list li').eq(-1) && 
    //     $('.pagination-list li').eq(-1).length !== 0 && 
    //     $('.pagination-list li').eq(-1).find('a').attr('href')) {
    //     console.log('next page exists');
    //     console.log(`$('.pagination-list li').eq(-1): `, $('.pagination-list li').eq(-1));
    //     console.log('href="', $('.pagination-list li').eq(-1).find('a').attr('href'), '"');
    //     const next = 'https://au.indeed.com' + $('.pagination-list li').eq(-1).find('a').attr('href');
    //     sleep.sleep(2);
    //     return pageLoader(next);
    // }
    // else {
    //     console.log('jobs: ', jobs)
    //     for (let i = 0; i < jobs.length; i++) {
    //         sleep.sleep(2);
    //         await jobLoader(jobs[i].link, i);
    //         if (i === jobs.length - 1) {
    //             break;
    //         }
    //     }
    //     return jobs;
    // }
}

function getJobInfo($, t) {
    const link = $(t).find('h2.title a.jobtitle').eq(0).attr('href');
    const name = $(t).find('h2.title a.jobtitle').eq(0).text().replace(/\n/g, '');
    const companyName = $(t).find('div.sjcl span.company').eq(0).text().replace(/\n/g, '');
    const time = $(t).find('div.jobsearch-SerpJobCard-footer div.jobsearch-SerpJobCard-footerActions div.result-link-bar-container span.date').eq(0).text();
    const location = $(t).find('div.sjcl .location.accessible-contrast-color-location').eq(0).text().split(', ')[1];
    const area = $(t).find('div.sjcl .location.accessible-contrast-color-location').eq(0).text().split(', ')[0];
    if (link && name && 
        (
            (
                !name.toLowerCase().includes('php') && 
                !name.toLowerCase().includes('python') && 
                !name.toLowerCase().includes('java') && 
                !name.toLowerCase().includes('angular') && 
                !name.toLowerCase().includes('vue')
            ) || (
                name.toLowerCase().includes('node') 
            )
        ) && 
        !name.toLowerCase().includes('ios') && 
        !name.toLowerCase().includes('android') && 
        !name.toLowerCase().includes('mobile')
    ) {
        let info = {
            link: 'https://au.indeed.com' + link,
            name: name,
            companyName: companyName, 
            time: time,
            location: location,
            area: area,
            country: 'Australia'
        }
        return info;
    }
    else {
        return null;
    }
}

async function jobLoader(url, index) {
    console.log('url: ', url);
    console.log('index: ', index);
    // let html = await sp.get(url);
    const page = await browser.newPage()
    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 0
    }) // your url here
  
    // // 2. 将字符串导入，使用cheerio获取元素
    // let $ = cheerio.load(html.text);
        
    // // 3. 获取指定的元素
    // $('.Ne1m3o8').each(function () {
    //     if ($(this).eq(0).attr('href') && $(this).eq(0).attr('href').split(':').length !== 0) {
    //         const email = $(this).eq(0).attr('href').split(':')[1];
    //         if (email) {
    //             jobs[index].email = email;
    //         }
    //         else {
    //             jobs[index].email = null;
    //         }
    //     }
    // })
    // jobs[index].description = $('#jobDescriptionText').eq(0).html();

    // console.log('jobs[index].email: ', jobs[index].email);
    // console.log('jobs[index].description: ', jobs[index].description);

    // return jobs;
}


/* 
 添加行到文件
 */
function appendLine(file, line) {
    return new Observable(subscriber => {
      fs.appendFile(file, line + '\n', err => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next(line);
          subscriber.complete();
        }
      });
    });
  }