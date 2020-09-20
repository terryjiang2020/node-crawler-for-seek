// node-pachong/index.js
/**
 * 使用Node.js做爬虫实战
 * author: justbecoder <justbecoder@aliyun.com>
 */

// 引入需要的工具包
const sp = require('superagent');
const cheerio = require('cheerio');

// 定义请求的URL地址
// const BASE_URL = 'http://www.23us.so';
// const keywords = 'developer-jobs';
const keywords = 'java-jobs';
const BASE_URL = 'https://www.seek.co.nz/' + keywords;
// const personal_token = 'token f6ee808fd4548d96253418d00d6dee4def13a8ae';
// const headers = {
//     'User-Agent':'Mozilla/5.0',
//     'Authorization': 'token ef802a122df2e4d29d9b1b868a6fefb14f22b272',
//     'Content-Type':'application/json',
//     'Accept':'application/json'
// }

let books = [];
// 1. 发送请求，获取HTML字符串
(async () => {

    pageLoader(BASE_URL);

    // let html = await sp.get(BASE_URL);
  
    // // 2. 将字符串导入，使用cheerio获取元素
    // let $ = cheerio.load(html.text);
    
    // // 3. 获取指定的元素
    // $('._3MPUOLE.-LbF7kM div').each(function () {
    //     const info = getJobInfo($, this);
    //     if (info !== null) {
    //         books.push(info);
    //     }
    // })


    // if ($('.bHpQ-bp').eq(0)) {
    //     console.log('next page exists');
    //     console.log('href="', $('.bHpQ-bp').eq(0).attr('href'), '"');
    // }

})()

async function pageLoader(url) {
    let html = await sp.get(url);
  
    // 2. 将字符串导入，使用cheerio获取元素
    let $ = cheerio.load(html.text);
    
    // 3. 获取指定的元素
    $('._3MPUOLE.-LbF7kM div').each(function () {
        const info = getJobInfo($, this);
        if (info !== null) {
            books.push(info);
        }
    })

    if (
        $('.bHpQ-bp').eq(0) && 
        $('.bHpQ-bp').eq(0).length !== 0 && 
        !(
            $('.bHpQ-bp').eq(0).attr('href') && 
            $('.bHpQ-bp').eq(0).attr('href').split('?').length > 1 && 
            $('.bHpQ-bp').eq(0).attr('href').split('?')[1] === 'page=200')
        ) {
        console.log('next page exists');
        console.log(`$('.bHpQ-bp').eq(0).attr('href').split('?'): `, $('.bHpQ-bp').eq(0).attr('href').split('?'));
        console.log('href="', $('.bHpQ-bp').eq(0).attr('href'), '"');
        const next = 'https://www.seek.co.nz' + $('.bHpQ-bp').eq(0).attr('href');
        return pageLoader(next);
    }
    else {
        console.log('books: ', books)
        return books;
    }
}

function getJobInfo($, t) {
    const link = $(t).find('a').eq(0).attr('href');
    const name = $(t).find('a').eq(0).text();
    const companyName = $(t).find('a').eq(1).text();
    const time = $(t).find('span.Eadjc1o').eq(0).text();
    if (link && link.substring(0,4) === '/job') {
        let info = {
            link: link,
            name: name,
            companyName: companyName,
            time: time,
            // image: $(this).find('img').attr('src')
        }
        return info;
    }
    else {
        return null;
    }
}