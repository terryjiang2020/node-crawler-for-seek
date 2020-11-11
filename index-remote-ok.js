// node-pachong/index.js
/**
 * 使用Node.js做爬虫实战
 * author: justbecoder <justbecoder@aliyun.com>
 */

// 引入需要的工具包
const sp = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 定义请求的URL地址
const BASE_URL = 'https://remoteok.io/api';

let jobs = [];
// 1. 发送请求，获取HTML字符串
(async () => {

    // fetchRemoteJobsFromRemoteOk();

    // await pageLoader(BASE_URL);

    var file = path.join(__dirname, 'remote-ok.json'); 
    
    fs.readFile(file, async function(err, data) {
        if (err) {
            return console.log(err);
        }
        let array = JSON.parse(data);
        console.log('array: ', array);
        for (let i = 0; i < array.length; i++) {
            console.log('i: ', i);
            await jobLoader(array[i].url, i);
        }
        // console.log('文件创建成功，地址：' + file);
    });

    // console.log('jobs: ', jobs);

    // var content = JSON.stringify(jobs);
    
    // fs.writeFile(file, content, function(err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log('文件创建成功，地址：' + file);
    // });

})()

async function pageLoader(url) {
    let html = await sp.get(url);
  
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
    
    // 3. 获取指定的元素
    $('._3MPUOLE.-LbF7kM div').each(function () {
        const info = getJobInfo($, this);
        if (info !== null) {
            jobs.push(info);
        }
    })

    if (
        $('.bHpQ-bp').eq(0) && 
        $('.bHpQ-bp').eq(0).length !== 0 && 
        !(
            $('.bHpQ-bp').eq(0).attr('href') && 
            $('.bHpQ-bp').eq(0).attr('href').split('?').length > 1 && 
            // $('.bHpQ-bp').eq(0).attr('href').split('?')[1] === 'daterange=14&page=200')
            $('.bHpQ-bp').eq(0).attr('href').split('?')[1] === 'daterange=14&page=100')
        ) {
        console.log('next page exists');
        console.log(`$('.bHpQ-bp').eq(0).attr('href').split('?'): `, $('.bHpQ-bp').eq(0).attr('href').split('?'));
        console.log('href="', $('.bHpQ-bp').eq(0).attr('href'), '"');
        const next = 'https://www.seek.co.nz' + $('.bHpQ-bp').eq(0).attr('href');
        return pageLoader(next);
    }
    else {
        for (let i = 0; i < jobs.length; i++) {
            setTimeout(() => {return jobLoader(jobs[i].link, i)}, 1000 * i);
            if (i === jobs.length - 1) {
                break;
            }
        }
        // console.log('jobs: ', jobs);
        // test.postJobs(jobs);
        return jobs;
    }
}


function fetchRemoteJobsFromRemoteOk() {
    console.log('fetchRemoteJobsFromRemoteOk is triggered');
    // var optionsget = {
    //     host : 'remoteok.io', // here only the domain name
    //     // (no http/https !)
    //     port : 443,
    //     path : '/api', // the rest of the url with parameters if needed
    //     method : 'GET', // do GET
    // };

    // console.info('Options prepared:');
    // console.info(optionsget);
    // console.info('Do the GET call');

    // // do the GET request
    // var reqGet = https.request(optionsget, function(res) {
    //     console.log("statusCode: ", res.statusCode);
    //     // uncomment it for header details
    //     console.log("headers: ", res.headers);
    //     var body = '';
    //     res.on('data', function(d) {
    //         console.info('GET result:\n', d);
    //         process.stdout.write(d);
    //         body += d;
    //         console.info('\n\nCall completed');
    //         console.log('d: ', d);
    //     });

    //     res.on('end', () => {
    //         // console.log('body: ', body);
    //         // const json = JSON.parse(body).json;
    //         // console.log('json: ', json);
    //         body = eval(body);
    //         console.log('Array.isArray(body): ', Array.isArray(body));
    //         console.log('body: ', body);
    //         if (res.statusCode === 200) {
    //             console.log('success');
    //             jobs = body;
    //             for (let i = 0; i < jobs.length; i++) {
    //                 if (jobs[i].url) {
    //                     jobLoader(jobs[i].url, i);
    //                 }
    //                 if (i === jobs.length - 1) {
    //                     break;
    //                 }
    //             }
    //             console.log('new jobs: ', jobs);
    //         }
    //     })
    //     console.log('res: ', res);
        
    // });
    
    // reqGet.end();
    // reqGet.on('error', function(e) {
    //     console.error('Error occurs: ', e);
    // });
}

function getJobInfo($, t) {
    const link = $(t).find('a').eq(0).attr('href');
    const name = $(t).find('a').eq(0).text();
    const companyName = $(t).find('a').eq(1).text();
    const time = $(t).find('span.Eadjc1o').eq(0).text();
    const location = $(t).find('div.xxz8a1h span._3FrNV7v._3PZrylH.E6m4BZb a._3AMdmRg').eq(0).text();
    const area = $(t).find('div.xxz8a1h span._3FrNV7v._3PZrylH.E6m4BZb a._3AMdmRg').eq(1).text();
    if (link && link.substring(0,4) === '/job') {
        let info = {
            link: 'https://www.seek.co.nz' + link,
            name: name,
            companyName: companyName, 
            time: time,
            location: location,
            area: area, 
            country: 'New Zealand'
        }
        return info;
    }
    else {
        return null;
    }
}

async function jobLoader(url, index) {
    setTimeout(async () => {
        let html = await sp.get(url);
    
        // console.log('html: ', html);
      
        // 2. 将字符串导入，使用cheerio获取元素
        // let $ = cheerio.load(html.text);
        
        // 3. 获取指定的元素
        // $('.description').each(function () {
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
    
        // const description = $('.description').eq(0).html();
        // if (description) {
        //     jobs[index].description = description;
        // } else {
        //     jobs[index].description = null;
        // }
    }, 3000 * index);

    return jobs;
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