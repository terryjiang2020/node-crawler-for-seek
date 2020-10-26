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

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'node-jobs';
const BASE_URL = 'https://www.seek.co.nz/' + keywords + '?daterange=14';
// const BASE_URL = 'https://www.seek.co.nz/' + keywords;
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

const recruitment_agency = [
    'Halo Consulting Ltd', 
    'Find IT Recruitment', 
    'Sunstone Talent', 
    'Crescent Consulting', 
    'Robert Walters', 
    'BrightSpark Recruitment', 
    'Potentia', 
    '40 Foot Consulting Limited', 
    'Robert Half Technology', 
    'Recruit IT – Your IT Career and Contract Specialists', 
    'Younity', 
    'RWA People - Connecting ITpeople with outstanding jobs', 
    'Finite920', 
    'Crew Consulting', 
    'Presto Resourcing', 
    'AugmentX', 
    'placeMe IT Recruitment', 
    'Potentia Wellington', 
    'Absolute IT Limited', 
    'Randstad Technologies', 
    'Beyond Recruitment - Winner – Best Innovation –2018 Global Recruiter Awards', 
    'Techspace Consulting Limited', 
    'Sprout Group Ltd', 
    'Hays Information Technology', 
    'Twoticks',
    'Alexander James Limited', 
    'H2R Technology Limited',
    'Talent Army',
    'Socialite Recruitment Ltd.', 
    'HR Connect Ltd',
    'The Digital Store',
    'Momentum Consulting Group',
    'Enterprise Technology Recruitment Ltd', 
    'Sourced | IT Recruitment Specialists', 
    'Lloyd Executive Ltd', 
    'Halcyon Knights Pty Ltd', 
    'Milestone Information Technology', 
    'Verify Consulting', 
    'Peoplebank Australia NSW', 
    'Peoplebank Australia QLD', 
    'MANTECH INTERNATIONAL SYSTEMS RECRUITMENT',
    'Just Digital People',
    'Command Group', 
    'Michael Page Information Technology', 
    'Talent – Winner ‘Seek Large Recruitment Agency of the Year’ 3 consecutive years!', 
    'BLACKROC', 
    'FIRESOFT People', 
    'Preacta Recruitment', 
    'Talenza',
    'Attribute Group', 
    'u&u. Recruitment Partners',
    'White Bay Search',
    'Austcorp Executive', 
    'tekFinder', 
    'Perigon Group Pty Limited', 
    'Limelight People', 
    'Sirius Technology Melbourne part of Sirius People Pty Ltd', 
    'Lookahead Search', 
    'Finite IT Recruitment Solutions', 
    'Add Staff Recruitment Pty Ltd', 
    'Naviro', 
    'S2M', 
    'Private Advertiser', 
    'Aspirante', 
    'The Onset', 
    'CircuIT Recruitment Group', 
    'Attract People', 
    'PureTech Talent', 
    'SALT SEARCH PTY LTD', 
    'Redwolf + Rosch', 
    'Real Time Australia P/L', 
    'Greythorn Experis', 
];

let jobs = [];
// 1. 发送请求，获取HTML字符串
(async () => {

    await pageLoader(BASE_URL);

    console.log('jobs.length: ', jobs.length);

    var file = path.join(__dirname, 'seek-node-nz.json'); 
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
    $('._3MPUOLE div').each(function () {
        const info = getJobInfo($, this);
        if (info !== null && jobs.findIndex(j => j.link === info.link) === -1) {
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
        // for (let i = 0; i < jobs.length; i++) {
        //     await jobLoader(jobs[i].link, i);
        //     if (i === jobs.length - 1) {
        //         break;
        //     }
        // }
        // console.log('jobs: ', jobs);
        // test.postJobs(jobs);
        return jobs;
    }
}

function getJobInfo($, t) {
    const link = $(t).find('a').eq(0).attr('href');
    const name = $(t).find('a').eq(0).text();
    const companyName = $(t).find('a').eq(1).text();
    const time = $(t).find('span.Eadjc1o').eq(0).text();
    const location = $(t).find('div.xxz8a1h span._3FrNV7v._3PZrylH.E6m4BZb a._3AMdmRg').eq(0).text();
    const area = $(t).find('div.xxz8a1h span._3FrNV7v._3PZrylH.E6m4BZb a._3AMdmRg').eq(1).text();
    if (
        link && link.substring(0,4) === '/job' && 
        recruitment_agency.findIndex(x => x === companyName) === -1 && 
        !companyName.toLowerCase().includes('recruit') && 
        !companyName.toLowerCase().includes('people') && 
        !companyName.toLowerCase().includes('talent')
    ) {
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

    const description = $('div').data('automation', 'jobDescription').eq(0).html();
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