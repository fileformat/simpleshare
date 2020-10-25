// server.js
// where your node app starts

// init project
import axios from 'axios';
import Koa from 'koa';
import KoaPinoLogger from 'koa-pino-logger';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
//import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import Pino from 'pino';

import { linkBuilder } from './linkbuilder';
import * as sites from './sites';
import { sitemap } from './sitemap';
import * as templates from './templates';
import * as comparison from './comparison';

type KoaContext = Koa.ParameterizedContext<any, KoaRouter.IRouterParamContext<any, {}>>;

const app = new Koa();
app.proxy = true;

const logger = Pino();

app.use(KoaPinoLogger({ logger: logger }));

app.use( async (ctx, next) => {
    ctx.res.setHeader("Referrer-Policy", "unsafe-url");
    if (ctx.hostname != 'localhost') {
        ctx.res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    ctx.res.setHeader("X-Content-Type-Options", "nosniff");
    ctx.res.setHeader("X-Frame-Options", "SAMEORIGIN");
    ctx.res.setHeader("X-XSS-Protection", "1; mode=block");
    /*
     * I already have the max free domains at report-uri
    ctx.res.setHeader('Report-To', '{ "group": "default", "max_age": 31536000, "endpoints": [{ "url": "https://fileformat.report-uri.com/a/d/g" }], "include_subdomains": true }');
    ctx.res.setHeader('NEL', '{ "report_to": "default", "max_age": 31536000, "include_subdomains": true }');
     */
    await next();
});

app.use( async (ctx, next) => {
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

app.use(KoaStatic("public", { maxage: 24 * 60 * 60 * 1000 }));

app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
            'encodeURIComponent': function (a: any) {
                return encodeURIComponent(a)
            },
            'ischecked': function(value:string, checks:string[]) {
                return checks && checks.indexOf(value) != -1;
            }
        },
        partials: {
            above: path.join(__dirname, '..', 'partials', 'above'),
            below: path.join(__dirname, '..', 'partials', 'below')
        }
    }
}));

const rootRouter = new KoaRouter();

rootRouter.get('/', async (ctx) => {
    await ctx.render('index.hbs', { 
        shareUrl: "https://simpleshare.io/",
        shareText: "Simple script-less share buttons",
        shareSummary: "The most awesome-est way to share!!!",
        sites: sites.getAll(),
        title: 'SimpleShare.IO - simple script-less social sharing', 
        hideh2: true
    });
});

rootRouter.get('/contact.html', async (ctx) => {
    await ctx.render('contact.hbs', {
        title: 'Contact',
    });
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get("/linkbuilder.html", linkBuilder);

rootRouter.get('/sitemap.xml', sitemap);

rootRouter.get('/status.json', async (ctx) => {
    const retVal: {[key:string]: any } = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["lastmod"] = process.env.LASTMOD || null;
    retVal["commit"] = process.env.COMMIT || null;
    retVal["tech"] = "NodeJS " + process.version;
    retVal["GA_ID"] = process.env.GA_ID || '(not set)';
    retVal["targetcount"] = sites.getAll().length;
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

function sendJSON(ctx: KoaContext, data: object) {

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

function getVariables(ctx: KoaContext) {
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
    rootRouter
    result["URL"] = encodeURIComponent(ctx.request.query["url"]);
    result["TEXT"] = encodeURIComponent(text);
    result["SUMMARY"] = encodeURIComponent(summary);
    result["IMAGE"] = encodeURIComponent(image);

    return result;
}

function getSite(ctx: KoaContext):sites.SiteData|null {
    if ('site' in ctx.request.query == false) {
        sendJSON(ctx, {
            success: false,
            code: 400,
            message: "Parameter 'site' is required"
        });
        return null;
    }

    const site = sites.get(ctx.request.query["site"]);
    if (site == null) {
        sendJSON(ctx, {
            success: false,
            code: 404,
            message: `Site '${ctx.request.query["site"]}' is not supported yet`
        });
        return null;
    }

    return site;
}

function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = (c == 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function trackEvent(ctx: KoaContext, ga_id:string | undefined, event:{[key:string]:string}) {
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

    axios.post("https://www.google-analytics.com/collect", {
        form: formData
    });
}

rootRouter.get('/go', function (ctx) {
    const site = getSite(ctx);
    if (site == null) {
        return;
    }

    const vars = getVariables(ctx);
    if (vars == null) {
        return;
    }

    logger.info( { site: site, data: vars }, 'Redirecting');

    const loc = site.templateFn(vars);

    ctx.set('Referrer-Policy', 'unsafe-url');
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

async function main() {

    await Promise.all([ 
        sites.initialize(logger),
        templates.initialize(logger),
        comparison.initialize(logger)
    ]);

    app.use(comparison.comparisonRouter.routes());

    const listener = app.listen(process.env.PORT || "4000", function () {
        logger.info( { address: listener.address(), ga_id: process.env.GA_ID || '(not set)' }, 'Running');
    });
}

main();




