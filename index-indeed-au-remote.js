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
const sleep = require('sleep');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'developer';
// const BASE_URL = 'https://au.indeed.com/jobs?q=' + keywords + '&fromage=14';
const BASE_URL = 'https://au.indeed.com/jobs?q=developer&remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11&start=0'
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

let jobs = [];

tag_alternatives_array = [
    {
        origin: 'fullstack', 
        alternative: ['full stack', 'full-stack']
    },
    {
        origin: 'frontend', 
        alternative: ['front end', 'front-end']
    },
    {
        origin: 'backend', 
        alternative: ['back end', 'back-end']
    },
    {
        origin: 'react.js', 
        alternative: ['react', 'reactjs', 'react-js']
    },
    {
        origin: 'react native', 
        alternative: ['react-native', 'reactnative']
    },
    {
        origin: 'javascript', 
        alternative: ['js']
    },
    {
        origin: 'angular.js', 
        alternative: ['angularjs']
    }, 
    {
        origin: 'vue.js', 
        alternative: ['vuejs', 'vue']
    }, 
    {
        origin: 'golang', 
        alternative: ['go']
    },
    {
        origin: 'node.js', 
        alternative: ['nodejs', 'node', 'node js']
    },
    {
        origin: 'c++', 
        alternative: ['c plus plus', 'c-plus-plus']
    }, 
    {
        origin: 'c#', 
        alternative: ['c sharp', 'c-sharp']
    }, 
    {
        origin: 'django', 
        alternative: ['python django']
    },
    {
        origin: '.net', 
        alternative: ['dot net']
    },
    {
        origin: 'manual testing', 
        alternative: ['manual_testing']
    },
    {
        origin: 'ember.js', 
        alternative: ['emberjs', 'ember js', 'ember']
    },
    {
        origin: 'mssql', 
        alternative: ['ms sql']
    }, 
    {
        origin: 'objective c',
        alternative: ['objectivec', 'objective-c']
    },
    {
        origin: 'visual basic', 
        alternative: ['visual-basic', 'visualbasic']
    },
    {
        origin: 'postgres', 
        alternative: ['postgresql']
    }
]

// 1. 发送请求，获取HTML字符串
(async () => {

    await pageLoader(BASE_URL);

    console.log('jobs: ', jobs);

    console.log('jobs.length: ', jobs.length);

    var file = path.join(__dirname, 'indeed-au-remote.json'); 
    var content = JSON.stringify(jobs);
    
    fs.writeFile(file, content, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('文件创建成功，地址：' + file);
    });

})()

async function pageLoader(url) {

    let html = await sp.get(url);
  
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
    
    // 3. 获取指定的元素
    $('#resultsCol div.jobsearch-SerpJobCard').each(function () {
        console.log('element caught');
        const info = getJobInfo($, this);
        if (info !== null) {
            jobs.push(info);
        }
    })

    if (
        $('.pagination-list li').eq(-1) && 
        $('.pagination-list li').eq(-1).length !== 0 && 
        $('.pagination-list li').eq(-1).find('a').attr('href')) {
        console.log('next page exists');
        console.log(`$('.pagination-list li').eq(-1): `, $('.pagination-list li').eq(-1));
        console.log('href="', $('.pagination-list li').eq(-1).find('a').attr('href'), '"');
        const next = 'https://au.indeed.com' + $('.pagination-list li').eq(-1).find('a').attr('href');
        sleep.sleep(2);
        return pageLoader(next);
    }
    else {
        console.log('jobs: ', jobs)
        for (let i = 0; i < jobs.length; i++) {
            sleep.sleep(2);
            await jobLoader(jobs[i].link, i);
            if (i === jobs.length - 1) {
                break;
            }
        }
        return jobs;
    }
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

function addTag(job) {
    console.log('addTag is triggered');

    for (let x = 0; x < tag_alternatives_array.length; x++) {
        const origin = tag_alternatives_array[x].origin;
        for (let y = 0; y < tag_alternatives_array[x].alternative.length; y++) {
            const alternative = tag_alternatives_array[x].alternative[y];
            if (a.findIndex(m => m === origin) !== -1) {
                if (a.findIndex(x => x === alternative) !== -1) {
                    a.splice(a.findIndex(x => x === alternative), 1);
                }
            }
            else {
                if (a.findIndex(x => x === alternative) !== -1) {
                    a.splice(a.findIndex(x => x === alternative), 1, origin);
                }
            }
            if (y === tag_alternatives_array[x].alternative.length - 1) {
                break;
            }
        }
        if (x === tag_alternatives_array.length - 1) {
            break;
        }
    }
    return a;
}

async function jobLoader(url, index) {
    let html = await sp.get(url);
  
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
        
    // 3. 获取指定的元素
    $('.Ne1m3o8').each(function () {
        if ($(this).eq(0).attr('href') && $(this).eq(0).attr('href').split(':').length !== 0) {
            const email = $(this).eq(0).attr('href').split(':')[1];
            if (email) {
                jobs[index].email = email;
            }
            else {
                jobs[index].email = null;
            }
        }
    })
    jobs[index].description = $('#jobDescriptionText').eq(0).html();

    console.log('jobs[index].email: ', jobs[index].email);
    console.log('jobs[index].description: ', jobs[index].description);

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