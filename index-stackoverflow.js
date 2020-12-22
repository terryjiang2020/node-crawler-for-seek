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
const test = require('./test');
const sleep = require('sleep');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'developer-jobs';
const BASE_URL = 'https://stackoverflow.com/jobs/remote-developer-jobs?sort=p&pg=';
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

    await pageLoader(BASE_URL);

    // console.log('jobs: ', jobs);

    // var file = path.join(__dirname, 'stackoverflow.json'); 
    // var content = JSON.stringify(jobs);
    
    // fs.writeFile(file, content, function(err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log('文件创建成功，地址：' + file);
    // });

})()

async function pageLoader(url) {
    sleep.sleep(3);
    let html = await sp.get(url);
      
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
    
    // 3. 获取指定的元素
    $('.listResults div.js-result').each(function () {
        const info = getJobInfo($, this);
        if (info !== null && jobs.findIndex(j => j.link === info.link) === -1) {
            console.log('info.link: ', info.link);
            jobs.push(info);
        }
    })

    if (
        $('.s-pagination .s-pagination--item').eq(-1) && 
        $('.s-pagination .s-pagination--item').eq(-1).length !== 0 && 
        $('.s-pagination .s-pagination--item').eq(-1).attr('class').split(' ').findIndex(r => r === 'is-selected') === -1 && 
        jobs.length < 100 
    ) {
        console.log('next page exists');
        console.log(`$('.s-pagination .s-pagination--item').eq(-1).attr('class').split(' '): `, $('.s-pagination .s-pagination--item').eq(-1).attr('class').split(' '));
        console.log(`$('.s-pagination .s-pagination--item').eq(-1).attr('href').split('?'): `, $('.s-pagination .s-pagination--item').eq(-1).attr('href').split('?'));
        console.log('href="', $('.s-pagination .s-pagination--item').eq(-1).attr('href'), '"');
        const next = 'https://stackoverflow.com' + $('.s-pagination .s-pagination--item').eq(-1).attr('href');
        await pageLoader(next);
        return jobs;
    }
    else {
        console.log('no more next page');
        for (let i = 0; i < jobs.length; i++) {
            await jobLoader(jobs[i].link, i);
            if (i === jobs.length - 1) {
                break;
            }
        }
        // console.log('jobs: ', jobs);
        // test.postJobs(jobs);
        console.log('jobs: ', jobs);

        var file = path.join(__dirname, 'stackoverflow.json'); 
        var content = JSON.stringify(jobs);
        
        fs.writeFile(file, content, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log('文件创建成功，地址：' + file);
        });
        return jobs;

        // setTimeout(() => {
        //     var file = path.join(__dirname, 'stackoverflow.json'); 
        //     var content = JSON.stringify(jobs);
            
        //     fs.writeFile(file, content, function(err) {
        //         if (err) {
        //             return console.log(err);
        //         }
        //         console.log('文件创建成功，地址：' + file);
        //     });
        //     return jobs;
        // }, 3000 * (jobs.length + 1));
    }
}

function getJobInfo($, t) {
    console.log('getJobInfo is triggered');
    const link = $(t).find('.grid .grid--cell a').eq(0).attr('href');
    const name = $(t).find('.grid .grid--cell a').eq(0).text();
    const company = $(t).find('h3.fc-black-700.fs-body1.mb4 span').eq(0).text().replace(/  /g, '').replace(/\n/g, '');
    const companyIcon = $(t).find('img.w48.h48.bar-sm').eq(0).attr('src');
    const time = $(t).find('.mt4.fs-caption.fc-black-500.horizontal-list li span').eq(0).text();
    const location = $(t).find('h3.fc-black-700.fs-body1.mb4 span').eq(1).text().replace(/  /g, '').replace(/\n/g, '');;
    const tags = [];
    // $(t).find('div.ps-relative.d-inline-block.z-selected a.post-tag.no-tag-menu').each(() => {
    //     console.log('$(this).eq(0).text(): ', $(this).eq(0).text());
    //     tags.push($(this).eq(0).text());
    // });
    const date_unit = time.replace(/[0-9]/g, '');
    var date;
    console.log('date_unit: ', date_unit);
    const date_number = parseInt(time.replace(date_unit, ''));
    if (date_unit === 'm ago') {
        date = new Date(new Date().setMinutes(new Date().getMinutes() - parseInt(date_number)));
    } else 
    if (date_unit === 'h ago') {
        date = new Date(new Date().setHours(new Date().getHours() - parseInt(date_number)));
    } else 
    if (date_unit === 'd ago') {
        date = new Date(new Date().setDate(new Date().getDate() - parseInt(date_number)));
    } else 
    if (date_unit === 'yesterday' || date_unit === 'Yesterday') {
        date = new Date(new Date().setDate(new Date().getDate() - 1));
    } else {
        date = new Date();
    }
    console.log('date: ', date);
    
    const area = null;
    console.log('link: ', link);
    if (link && link.substring(0,4) === '/job') {
        let info = {
            link: 'https://stackoverflow.com' + link, 
            name: name, 
            position: name, 
            date: date,
            company: company, 
            companyIcon: companyIcon, 
            time: time, 
            location: location, 
            area: area, 
            country: null, 
            tags: tags 
        }
        return info;
    }
    else {
        return null;
    }
}

async function jobLoader(url, index) {
    
    sleep.sleep(3);
    let html = await sp.get(url);
      
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
    
    // 3. 获取指定的元素
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
    $('a').each((i, e) => {
        if ($(this).eq(0).attr('href') && $(this).eq(0).attr('href').substring(0,7) === 'mailto') {
            jobs[index].email = $(this).eq(0).attr('href').split(':')[1];
        }
        else {
            jobs[index].email = null;
        }
    })

    // $('div#overview-items section.mb32 > div > a.post-tag.no-tag-menu').each(() => {
    //     console.log('$(this).eq(0).html(): ', $(this).eq(0).html());
    //     console.log('$(this).eq(0).text(): ', $(this).eq(0).text());
    //     jobs[index].tags.push($(this).eq(0).html());
    // })

    console.log("$('div#overview-items section.mb32').length: ", $('div#overview-items section.mb32').length);
    console.log("$('div#overview-items section.mb32 > div > a.post-tag.no-tag-menu').length: ", $('div#overview-items section.mb32 > div > a.post-tag.no-tag-menu').length);
    var description = '';

    for (let j = 0; j < $('div#overview-items section.mb32 > div > a.post-tag.no-tag-menu').length; j++) {
        jobs[index].tags.push($('div#overview-items section.mb32 > div > a.post-tag.no-tag-menu').eq(j).text());
    }

    console.log('jobs[index].tags: ', jobs[index].tags);

    for (let i = 0; i < $('div#overview-items section.mb32').length; i++) {

        console.log("$('div#overview-items section.mb32').eq(i).html(): ", $('div#overview-items section.mb32').eq(i).html());
        console.log("$('div#overview-items section.mb32').eq(i).children().first().text(): ", $('div#overview-items section.mb32').eq(i).children().first().text());
        const title = $('div#overview-items section.mb32').eq(i).children().first().text();
        const content = $('div#overview-items section.mb32').eq(i).html().replace(/\n/g, '').replace(/                 <h2 class=\"fs-subheading mb16 fc-dark\">/g, '                 <br><h2 class=\"fs-subheading mb16 fc-dark\">').replace('<br>', '').replace(/<\/h2>/g, '</h2><br></br>');
        if (title !== 'Technologies') {
            description += content;
        }
    }

    console.log("$('.js-apply').length: ", $('.js-apply').length);

    const apply_link = $('.js-apply').eq(0).attr('href');
    console.log('apply_link: ', apply_link);
    if (apply_link) {
        if (apply_link.substring(0) !== '/') {
            jobs[index].apply_link = apply_link;
        }
        else {
            jobs[index].apply_link = 'https://stackoverflow.com' + apply_link;
        }
    }
    else {
        jobs[index].apply_link = jobs[index].link;
    }

    // const description = $('div#overview-items').eq(0).html();
    console.log('description: ', description);
    if (description) {
        jobs[index].description = description;
    } else {
        jobs[index].description = null;
    }

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