const http = require('http');
const url = require("url");
var request = require('request');
var cachedImages = [];

var options = {

    json: true,
    strictSSL:false,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
    }
};

var baseRequest = request.defaults(options);

var imgReq = request.defaults({

    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'http://www.ssyer.com/',
        'Accept-Encoding': 'gzip, deflate',
        'content-type': 'charset=utf-8'

    }
});

function getRandomPic(type,process, res) {
    if (!cachedImages[type]) {
        baseRequest.get(`https://web.ssyer.com/workItem/searchByTagId?createdAt=1532501075&tagId=${type}&size=20&pageNo=1`, function (error, response, body) {

            if (!error && body.data) {
                cachedImages[type] = {
                    reqDate: new Date().getTime(),
                    imgs: body.data
                };

                responseImage(body.data,process,res);
            } else {
                let err = error || "Server image response is empty";
                console.log(err);
                res.writeHead(200, {
                    "Content-Type": "text/plain"
                });
                res.end(err);
            }
        });
    } else {
        if (new Date().getTime() - cachedImages[type].reqDate < 1000 * 60 * 60) {
            responseImage(cachedImages[type].imgs,process,res);
        } else {
            cachedImages[type] = null;
            getRandomPic(type,process, res);
        }
    }
}

function responseImage(images,process,res) {
    var rdmIndex = Math.floor(Math.random() * images.length);
    var picUrl = images[rdmIndex].link + "?x-oss-process=" + process;
    var pixReq = imgReq(encodeURI(picUrl));
    pixReq.pipe(res);
}

http.createServer(function (req, resp) {
    var queryData = url.parse(req.url, true).query;
    getRandomPic(queryData.type || 'rkSDHWB1Q', queryData.process || "image/resize,m_lfit,h_720,w_720", resp);

}).listen(8085);