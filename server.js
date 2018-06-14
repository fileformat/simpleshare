// server.js
// where your node app starts

// init project
var express = require('express');
var fs = require('fs');
var os = require('os');
var request = require('request');

var app = express();


app.use(express.static('public'));

function getStatus() {
    var retVal = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["lastmod"] = process.env.LASTMOD || null;
    retVal["commit"] = process.env.COMMIT || null;
    retVal["__dirname"] = __dirname;
    retVal["__filename"] = __filename;
    retVal["os.hostname"] = os.hostname();
    retVal["os.type"] = os.type();
    retVal["os.platform"] = os.platform();
    retVal["os.arch"] = os.arch();
    retVal["os.release"] = os.release();
    retVal["os.uptime"] = os.uptime();
    retVal["os.loadavg"] = os.loadavg();
    retVal["os.totalmem"] = os.totalmem();
    retVal["os.freemem"] = os.freemem();
    retVal["os.cpus.length"] = os.cpus().length;
    // too much junk: retVal["os.networkInterfaces"] = os.networkInterfaces();

    retVal["process.arch"] = process.arch;
    retVal["process.cwd"] = process.cwd();
    retVal["process.execPath"] = process.execPath;
    retVal["process.memoryUsage"] = process.memoryUsage();
    retVal["process.platform"] = process.platform;
    retVal["process.release"] = process.release;
    retVal["process.title"] = process.title;
    retVal["process.uptime"] = process.uptime;
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;
    retVal["process.installPrefix"] = process.installPrefix;

    return retVal;
}

app.get('/status.json', function (req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Access-Control-Max-Age': '604800'
    });

    sendJson(req, res, getStatus());
});

function getVariables(req, res) {
    var result = {};
    if ('url' in req.query == false) {
        result["success"] = false;
        result["code"] = 400;
        result["message"] = "Parameter 'url' is required";
        sendJson(req, res, result);
        return null;
    }

    var text = req.query["text"];
    if (text == null) {
        text = req.query["url"];      // LATER: split off just filename?
    }

    var summary = req.query["summary"];
    if (summary == null) {
        summary = "";
    }

    var image = req.query["image"];
    if (image == null) {
        image = "";
    }

    result["URL"] = encodeURIComponent(req.query["url"]);
    result["TEXT"] = encodeURIComponent(text);
    result["SUMMARY"] = encodeURIComponent(summary);
    result["IMAGE"] = encodeURIComponent(image);

    return result;
}

function getSite(req, res) {
    var result = {};
    if ('site' in req.query == false) {
        result["success"] = false;
        result["code"] = 400;
        result["message"] = "Parameter 'site' is required";
        sendJson(req, res, result);
        return null;
    }

    var site = req.query["site"];
    if (share_urls[site] == null) {
        result["success"] = false;
        result["code"] = 404;
        result["message"] = "Site '" + site + "' is not supported yet";
        sendJson(req, res, result);
        return null;
    }

    return site;
}

function make_template(strings, ...keys) {
    return (function (...values) {
        var dict = values[values.length - 1] || {};
        var result = [strings[0]];
        keys.forEach(function (key, i) {
            var value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}


function sendJson(req, res, jsonObj) {
    if ('callback' in req.query) {
        res.write(req.query["callback"]);
        res.write("(");
        res.write(JSON.stringify(jsonObj));
        res.write(");");
    }
    else {
        res.write(JSON.stringify(jsonObj));
    }
    res.end();
}

function trackEvent(req, ga_id, event) {
    if (!ga_id) {
        return;
    }
    var fields = {};
    fields.v = '1';
    fields.tid = ga_id;
    fields.cid = '';    // anonymous client id
    fields.t = 'event';
    fields.ec = event.eventCategory;
    fields.ea = event.eventAction;
    fields.el = event.eventLabel;
    fields.ev = event.eventValue;
    fields.ua = req.get('user-agent') || '(not set)';
    fields.uip = req.ip || null;

    var formData = {};
    formData.v = '1';
    formData.tid = ga_id;
    formData.cid = '';    // anonymous client id
    formData.t = 'event';
    if (event.eventCategory) {
        formData.ec = event.eventCategory;
    }
    if (event.eventAction) {
        formData.ea = event.eventAction;
    }
    if (event.eventLabel) {
        formData.el = event.eventLabel;
    }
    if (event.eventValue) {
        formData.ev = event.eventValue;
    }
    formData.ua = req.get('user-agent') || '(not set)';
    formData.uip = req.ip || '0.0.0.0';

    request.post({
        url: "https://www.google-analytics.com/collect",
        formData: formData
    }, function (error, response, body) {
        console.log("INFO: ga tracking for " + ga_id + " returned " + response.statusCode);
    });
}

app.get('/sitelist.json', function (req, res) {
    var result = {};

    var sites = [];

    var keys = Object.keys(share_urls);
    for (var loop = 0; loop < keys.length; loop++) {
        var site = share_urls[keys[loop]];
        var site_result = {name: site.name, id: keys[loop]};
        if (site.logo) {
            site_result.logolink = "https://www.vectorlogo.zone/logos/" + site.logo + "/index.html";
            site_result.logo = "https://www.vectorlogo.zone/logos/" + site.logo + "/" + site.logo + "-tile.svg";
        }
        var url = site.url_template({"SUMMARY": "${SUMMARY}", "IMAGE": "${IMAGE}"});
        site_result.has_summary = (url.indexOf("${SUMMARY}") > 0);
        site_result.has_image = (url.indexOf("${IMAGE}") > 0);
        site_result.mobile_only = (url.startsWith("https://") == false);
        sites.push(site_result);
    }

    result["sites"] = sites;
    result["success"] = true;
    result["code"] = 0;
    result["message"] = result["sites"].length + " sites available";
    sendJson(req, res, result);
});

app.get('/siteinfo.json', function (req, res) {
    var site = getSite(req, res);
    if (site == null) {
        return;
    }

    var result = {};

    result["success"] = true;
    result["message"] = "Information for " + share_urls[site].name;
    result["code"] = 0;
    result["site"] = site;
    result["info"] = {"name": share_urls[site].name, "url": share_urls[site].url_template};

    if (share_urls[site].logo) {
        result.info.logo = "https://www.vectorlogo.zone/logos/" + share_urls[site].logo + "/" + share_urls[site].logo + "-tile.svg";
    }
    sendJson(req, res, result);
});

app.get('/siteurl.json', function (req, res) {
    var site = getSite(req, res);
    if (site == null) {
        return;
    }

    var vars = getVariables(req, res);
    if (vars == null) {
        return;
    }

    var result = {};

    result["success"] = true;
    result["message"] = "Link to '" + req.query["url"] + "' for " + share_urls[site].name;
    result["code"] = 0;
    result["site"] = site;
    result["url"] = share_urls[site].url_template(vars);

    sendJson(req, res, result);
});


app.get('/go', function (req, res) {
    var site = getSite(req, res);
    if (site == null) {
        return;
    }

    var vars = getVariables(req, res);
    if (vars == null) {
        return;
    }

    console.log("DEBUG: site=" + site + " data=" + JSON.stringify(vars));

    var loc = share_urls[site].url_template(vars);

    res.redirect(loc);

    //webmaster's tracking
    trackEvent(req, req.query["ga"], {
        eventCategory: 'SHARE',
        eventAction: req.query["site"],
        eventValue: req.query["url"]
    });

    //simpleshare tracking
    trackEvent(req, process.env.GA_ID, {
        eventCategory: 'SHARE',
        eventAction: req.query["site"],
        eventValue: req.query["url"]
    });
});

var listener = app.listen(process.env.PORT, function () {
    console.log('Listening on port ' + listener.address().port);
});

// brutal HACK to avoid having to do ${'TEXT'} in the templates
var TEXT = 'TEXT';
var URL = 'URL';
var SUMMARY = 'SUMMARY';
var IMAGE = 'IMAGE';

var share_urls = {
    'facebook': {
        name: 'Facebook',
        logo: 'facebook',
        url_template: make_template`https://facebook.com/sharer/sharer.php?u=${URL}`
    },
    'googleplus': {
        name: 'Google+',
        logo: 'google_plus',
        url_template: make_template`https://plus.google.com/share?url=${URL}`
    },
    'hn': {
        name: 'Hacker News',
        logo: 'ycombinator',
        url_template: make_template`https://news.ycombinator.com/submitlink?u=${URL}&t=${TEXT}`
    },
    'linkedin': {
        name: 'LinkedIn',
        logo: 'linkedin',
        url_template: make_template`https://www.linkedin.com/shareArticle?mini=true&url=${URL}&title=${TEXT}&summary=${TEXT}&source=${URL}`
    },
    'pinboard': {
        name: 'Pinboard',
        logo: 'pinboard',
        url_template: make_template`https://pinboard.in/add?next=same&url=${URL}&description=${SUMMARY}&title=${TEXT}`
    },
    'pinterest': {
        name: 'Pinterest',
        logo: 'pinterest',
        url_template: make_template`https://pinterest.com/pin/create/button/?url=${URL}&media=${IMAGE}&summary=${TEXT}`
    },
    'pocket': {
        name: 'Pocket',
        logo: 'getpocket',
        url_template: make_template`https://getpocket.com/save?url=${URL}&title=${TEXT}`
    },
    'reddit': {
        name: 'Reddit',
        logo: 'reddit',
        url_template: make_template`https://reddit.com/submit/?url=${URL}`
    },
    'stumbleupon': {
        name: 'StumbleUpon',
        logo: 'stumbleupon',
        url_template: make_template`http://www.stumbleupon.com/submit?url=${URL}&title=${TEXT}`
    },
    'telegram': {
        name: 'Telegram',
        logo: 'telegram',
        url_template: make_template`https://telegram.me/share/url?text=${TEXT}&url=${URL}`
    },
    'tumblr': {
        name: 'Tumblr',
        logo: 'tumblr',
        url_template: make_template`https://www.tumblr.com/widgets/share/tool?posttype=link&title=${TEXT}&caption=${TEXT}&content=${URL}&canonicalUrl=${URL}&shareSource=tumblr_share_button`
    },
    'twitter': {
        name: 'Twitter',
        logo: 'twitter',
        url_template: make_template`https://twitter.com/intent/tweet/?text=${TEXT}&url=${URL}`
    },
    'vk': {
        name: 'VK',
        logo: 'vk',
        url_template: make_template`http://vk.com/share.php?url=${URL}&title=${TEXT}`
    },
    'whatsapp': {
        name: 'WhatsApp',
        logo: 'whatsapp',
        url_template: make_template`whatsapp://send?text=${TEXT}%20${URL}`
    },
    'wordpress': {
        name: 'Wordpress',
        logo: 'wordpress',
        url_template: make_template`https://wordpress.com/press-this.php?u=${URL}&t=${TEXT}&s=${SUMMARY}&i=${IMAGE}`
    },
    'xing': {
        name: 'XING',
        logo: 'xing',
        url_template: make_template`https://www.xing.com/app/user?op=share;url=${URL};title=${TEXT}`
    }
};

