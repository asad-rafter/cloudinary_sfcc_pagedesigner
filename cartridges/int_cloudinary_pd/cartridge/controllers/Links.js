'use strict';

var server = require('server');

server.get('url', server.middleware.https, function (req, res, next) {
    var linkArr = (req.querystring && req.querystring.linkData) ? JSON.parse(decodeURIComponent(req.querystring.linkData)) : null;
    res.setHttpHeader('Access-Control-Allow-Origin', '*');
    if (linkArr && linkArr.length > 0) {
        // eslint-disable-next-line new-cap
        var link = {
            status: 'ok',
            url: linkArr.toString()
        };
        res.json(link);
    } else {
        res.json({ status: 'error', message: 'no data' });
    }
    next();
});

module.exports = server.exports();
