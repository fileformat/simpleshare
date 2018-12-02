// server.js
// where your node app starts

// init project
import * as Koa from 'koa';
import * as KoaPinoLogger from 'koa-pino-logger';
import * as KoaRouter from 'koa-router';
import * as KoaStatic from 'koa-static';
import * as KoaViews from 'koa-views';
//import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as Pino from 'pino';
import * as request from 'request';

const app = new Koa();
app.proxy = true;

const logger = Pino();

app.use(KoaPinoLogger({ logger: logger }));

app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.log.warn( { url: ctx.request.url }, 'File not found');
            await ctx.render('404.hbs', { title: 'File not found (404)', url: ctx.request.url });
        }
    } catch (err) {
        ctx.log.error( { err, url: ctx.request.url }, 'Server Error');
        await ctx.render('500.hbs', { title: 'Server Error', message: err.message });
    }
});

app.use(KoaStatic("public"));

app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
        },
        partials: {
            above: path.join(__dirname, '..', 'partials', 'above'),
            below: path.join(__dirname, '..', 'partials', 'below')
        }
    }
}));

const rootRouter = new KoaRouter();

rootRouter.get('/', async (ctx) => {
    await ctx.render('index.hbs', { title: 'SimpleShare.IO - simple script-less social sharing', h1: 'SimpleShare.IO' });
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/status.json', async (ctx: Koa.Context) => {
    const retVal: {[key:string]: any } = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["lastmod"] = process.env.LASTMOD || null;
    retVal["commit"] = process.env.COMMIT || null;
    retVal["GA_ID"] = process.env.GA_ID || '(not set)';
    retVal["targetcount"] = Object.keys(share_urls).length;
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
    retVal["process.uptime"] = process.uptime();
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;

    sendJSON(ctx, retVal);
});

function sendJSON(ctx: Koa.Context, data: object) {

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET');
    ctx.set('Access-Control-Max-Age', '604800');

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.type = 'text/javascript';
        ctx.body = callback + '(' + JSON.stringify(data) + ');';
    } else {
        ctx.type = 'application/json';
        ctx.body = JSON.stringify(data);
    }
}

/*
app.get('/status.json', function (req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Access-Control-Max-Age': '604800'
    });

 sendJSON(req, res, getStatus());
});
*/

function getVariables(ctx: Koa.Context) {
    const result:{[key:string]: any} = {};
    if ('url' in ctx.request.query == false) {
        result["success"] = false;
        result["code"] = 400;
        result["message"] = "Parameter 'url' is required";
        sendJSON(ctx, result);
        return null;
    }

    // LATER: split off just filename?
    const text = ctx.request.query["text"] || ctx.request.query["url"];

    const summary = ctx.request.query["summary"] || '';

    const image = ctx.request.query["image"] || '';

    result["URL"] = encodeURIComponent(ctx.request.query["url"]);
    result["TEXT"] = encodeURIComponent(text);
    result["SUMMARY"] = encodeURIComponent(summary);
    result["IMAGE"] = encodeURIComponent(image);

    return result;
}

function getSite(ctx: Koa.Context) {
    const result:{[key:string]:any} = {};
    if ('site' in ctx.request.query == false) {
        result["success"] = false;
        result["code"] = 400;
        result["message"] = "Parameter 'site' is required";
        sendJSON(ctx, result);
        return null;
    }

    const site = ctx.request.query["site"];
    if (share_urls[site] == null) {
        result["success"] = false;
        result["code"] = 404;
        result["message"] = "Site '" + site + "' is not supported yet";
        sendJSON(ctx, result);
        return null;
    }

    return site;
}

function make_template(strings:TemplateStringsArray, ...keys:string[]) {
    return (function (...values:any[]) {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach(function (key, i) {
            const value = dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}

function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = (c == 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function trackEvent(ctx: Koa.Context, ga_id:string | undefined, event:{[key:string]:string}) {
    if (!ga_id) {
        return;
    }

    const formData:{[key:string]:string} = {};
    formData.v = '1';
    formData.tid = ga_id;
    formData.cid = guid();    // anonymous client id
    formData.t = 'event';
    if (event.eventCategory) {
        formData.ec = event.eventCategory;
    }
    if (event.eventAction) {
        formData.ea = event.eventAction;
    }
    if (event.eventLabel) {
        formData.el = event.eventLabel.substr(0, 500);
    }
    if (event.eventValue) {
        formData.ev = event.eventValue;
    }
    formData.ua = ctx.request.get('user-agent') || '(not set)';
    formData.uip = ctx.ip || '0.0.0.0';

    request.post({
        url: "https://www.google-analytics.com/debug/collect",
        form: formData
    }, function (err, response, body) {
        if (err) {
            ctx.log.error({ err, response, ga_id, formData, body }, "Google Analytics failed");
        } else {
            ctx.log.info({ ga_id, formData, body }, "Google Analytics success");
        }
    });
}

rootRouter.get('/sitelist.json', function (ctx: Koa.Context) {
    const result:{[key:string]: any} = {};

    const sites = [];

    const keys = Object.keys(share_urls);
    for (let loop = 0; loop < keys.length; loop++) {
        const site = share_urls[keys[loop]];
        const site_result:{[key:string]: any} = {name: site.name, id: keys[loop]};
        if (site.logo) {
            site_result.logolink = "https://www.vectorlogo.zone/logos/" + site.logo + "/index.html";
            site_result.logo = "https://www.vectorlogo.zone/logos/" + site.logo + "/" + site.logo + "-tile.svg";
        }
        const url = site.url_template({"SUMMARY": "${SUMMARY}", "IMAGE": "${IMAGE}"});
        site_result.has_summary = (url.indexOf("${SUMMARY}") > 0);
        site_result.has_image = (url.indexOf("${IMAGE}") > 0);
        site_result.mobile_only = (url.startsWith("https://") == false);
        sites.push(site_result);
    }

    result["sites"] = sites;
    result["success"] = true;
    result["code"] = 0;
    result["message"] = result["sites"].length + " sites available";
    sendJSON(ctx, result);
});

rootRouter.get('/siteinfo.json', function (ctx) {
    const site = getSite(ctx);
    if (site == null) {
        return;
    }

    const result:{[key:string]: any} = {};

    result["success"] = true;
    result["message"] = "Information for " + share_urls[site].name;
    result["code"] = 0;
    result["site"] = site;
    result["info"] = {"name": share_urls[site].name, "url": share_urls[site].url_template};

    if (share_urls[site].logo) {
        result.info.logo = "https://www.vectorlogo.zone/logos/" + share_urls[site].logo + "/" + share_urls[site].logo + "-tile.svg";
    }
    sendJSON(ctx, result);
});

rootRouter.get('/siteurl.json', function (ctx) {
    const site = getSite(ctx);
    if (site == null) {
        return;
    }

    const vars = getVariables(ctx);
    if (vars == null) {
        return;
    }

    const result:{[key:string]: any} = {};

    result["success"] = true;
    result["message"] = "Link to '" + ctx.request.query["url"] + "' for " + share_urls[site].name;
    result["code"] = 0;
    result["site"] = site;
    result["url"] = share_urls[site].url_template(vars);

    sendJSON(ctx, result);
});


rootRouter.get('/go', function (ctx) {
    const site = getSite(ctx);
    if (site == null) {
        return;
    }

    const vars = getVariables(ctx);
    if (vars == null) {
        return;
    }

    ctx.log.info( { site: site, data: vars }, 'Redirecting');

    const loc = share_urls[site].url_template(vars);

    ctx.redirect(loc);

    const event = {
        eventCategory: 'SHARE',
        eventAction: ctx.request.query["site"],
        eventLabel: ctx.request.query["url"]
    };

    //webmaster's tracking
    trackEvent(ctx, ctx.request.query['ga'], event);

    //simpleshare tracking
    trackEvent(ctx, process.env.GA_ID, event);
});

app.use(rootRouter.routes());

const listener = app.listen(process.env.PORT || "4000", function () {
    logger.info( { address: listener.address(), ga_id: process.env.GA_ID || '(not set)' }, 'Running');
});

// brutal HACK to avoid having to do ${'TEXT'} in the templates
const TEXT = 'TEXT';
const URL = 'URL';
const SUMMARY = 'SUMMARY';
const IMAGE = 'IMAGE';

interface ShareSite {
    name: string,
    logo: string,
    url_template: (...values:any[]) => string
}

const share_urls:{[key:string]:ShareSite} = {
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

