const http = require('http');
const url = require("url");
var request = require('request');
var cachedImages = [];

var options = {

    json: true,
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

function getRandomPic(type, res) {
    if (!cachedImages[type]) {
        baseRequest.post('http://www.ssyer.com/pc/order/orderList', {
            form: {
                labelId: type,
                start: 0,
                limit: 20
            }
        }, function (error, response, body) {

            if (!error && body.data.datas) {
                cachedImages[type] = {
                    reqDate: new Date().getTime(),
                    imgs: body.data.datas
                };

                var rdmIndex = Math.floor(Math.random() * 19);
                var picUrl = body.data.datas[rdmIndex].pictureUrl + "?x-oss-process=image/resize,m_lfit,h_720,w_720";
                var pixReq = imgReq(encodeURI(picUrl));
                pixReq.pipe(res);
            } else {
                let err =error || "Server image response is empty";
                console.log(err);
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(err);
            }
        });
    } else {
        if (new Date().getTime() - cachedImages[type].reqDate < 1000 * 60 * 60) {
            var rdmIndex = Math.floor(Math.random() * 19);
            var picUrl = cachedImages[type].imgs[rdmIndex].pictureUrl + "?x-oss-process=image/resize,m_lfit,h_720,w_720";
            var pixReq = imgReq(encodeURI(picUrl));
            pixReq.pipe(res);
        } else {
            cachedImages[type] = null;
            getRandomPic(req, res);
        }
    }
}

http.createServer(function (req, resp) {
    var queryData = url.parse(req.url, true).query;
    getRandomPic(queryData.type || 21, resp);

}).listen(8085);