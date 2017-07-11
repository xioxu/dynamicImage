const http = require('http');
var request = require('request');
var cachedImages = null;

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

function getRandomPic(req, res) {
    if (!cachedImages) {
        baseRequest.post('http://www.ssyer.com/pc/order/orderList', {
            form: {
                labelId: '21',
                start: 0,
                limit: 20
            }
        }, function (error, response, body) {

            if (!error) {
                cachedImages = {
                    reqDate: new Date().getTime(),
                    imgs: body.data.datas
                };

                var rdmIndex = Math.floor(Math.random() * 19);
                var picUrl = body.data.datas[rdmIndex].pictureUrl + "?x-oss-process=image/resize,m_lfit,h_720,w_720";
                var pixReq = imgReq(encodeURI(picUrl));
                pixReq.pipe(res);
            } else {
                console.log(error);
                res.send(error);
            }
        });
    } else {
        if (new Date().getTime() - cachedImages.reqDate < 1000 * 60 * 60) {
            var rdmIndex = Math.floor(Math.random() * 19);
            var picUrl = cachedImages.imgs[rdmIndex].pictureUrl + "?x-oss-process=image/resize,m_lfit,h_720,w_720";
            var pixReq = imgReq(encodeURI(picUrl));
            pixReq.pipe(res);
        }else{
            cachedImages = null;
            getRandomPic(req, res);
        }
    }
}

http.createServer(function (req, resp) {
    getRandomPic(req, resp);

}).listen(8085);