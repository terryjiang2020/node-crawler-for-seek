var https = require('https');
const querystring = require('querystring');
var request = require('request');


var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6IkFkbWluIiwic2NvcGVJZCI6MiwiaWF0IjoxNjAxNjkzMDEwLCJleHAiOjE2MDE3MTQ2MTB9.XSshtjujus8ml_q09qRdnZdVtwtIa0DjB3gUqmKnE2Q';

let headers = 
{
    'Authorization': 'Bearer ' + token,
    'Access-Control-Allow-Origin': 'https://app.skillsme.co.nz',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    'Content-Type': 'application/json'
}

let option = {
    hostname: 'app.skillsme.co.nz',
    path: '/api/test', 
    headers: headers
}

https.get(option, response => {

    response.on('data', chunk => {
        console.log('chunk: ', chunk);
    })
    
    response.on('end', () => {
        console.log('The whole response has been received. ');
        console.log('response: ', response);
    })
})
.on('error', err => {
    console.error('error: ', err.message);
})

exports.postJobs = function(jobList) {
    console.log('postJobs is triggered');
    console.log('jobList.length: ', jobList.length);
    
    var data = {
        'jobList' : jobList
    };
    var postData = querystring.stringify(data);  
    // var postData = querystring.stringify({
    //     'msg' : 'Hello World!'
    // });
    let option = {
            hostname: 'app.skillsme.co.nz',
            path: '/api/test', 
            headers: headers,
            method: 'POST',
            'Content-Type': 'application/json', 
    }
    // let option = {
    //     hostname: 'app.skillsme.co.nz',
    //     path: '/api/joblist/update', 
    //     headers: headers,
    //     method: 'POST',
    //     'Content-Type': 'application/json', 
    //     body: postData
    // }
    var req = https.request(option, res => {

        const contentType = res.headers['content-type'];
        if (contentType !== 'application/json') {
            console.log('cannot handle the data provided');
            return;
        }
    
        let data = '';
        res.on('data', chunk => {
            console.log('chunk: ', chunk);
            data += chunk.toString('utf8');
        })
        
        res.on('end', () => {
            console.log('The whole response has been received. ');
            // console.log('res: ', res);
            console.log('data: ', data);
        })
    })
    .on('error', err => {
        console.error('error: ', err.message);
    })

    req.on('error', err => {
        console.error('error: ', err.message);
    })

    console.log('postData: ', postData);
    req.write(postData);
    req.end();
}
 
function httprequest(url,data){
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('success');
            console.log(body) // 请求成功的处理逻辑
        }
    });
};
