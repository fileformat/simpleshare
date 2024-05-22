import Koa from 'koa';
import KoaPinoLogger from 'koa-pino-logger';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaViews from '@ladjs/koa-views';
import * as path from 'path';
import Pino from 'pino';

import { linkBuilder } from './linkbuilder';
import * as sites from './sites';
import { sitemap } from './sitemap';
import * as templates from './templates';
import * as util from './util';
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
            ctx.status = 404;
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
        shareUrl: "https://simpleshare.dev/",
        shareText: "Simple script-less share buttons",
        shareSummary: "The most awesome-est way to share!!!",
        sites: sites.getAll(),
        title: 'SimpleShare - simple script-less social sharing', 
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
    retVal["targetcount"] = sites.getAll().length;
     
    sendJSON(ctx, retVal);
});

function sendJSON(ctx: KoaContext, data: object) {

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET');
    ctx.set('Access-Control-Max-Age', '604800');

    const callback = util.getFirst(ctx.request.query['callback']);
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.type = 'text/javascript';
        ctx.body = callback + '(' + JSON.stringify(data) + ');';
    } else {
        ctx.type = 'application/json';
        ctx.body = JSON.stringify(data);
    }
}

function getVariables(ctx: KoaContext) {
    const result:{[key:string]: any} = {};
    if ('url' in ctx.request.query == false) {
        result["success"] = false;
        result["code"] = 400;
        result["message"] = "Parameter 'url' is required";
        sendJSON(ctx, result);
        return null;
    }

    const targetUrl = util.getFirst(ctx.request.query["url"]) || '';

    // LATER: split off just filename?
    const text = util.getFirst(ctx.request.query["text"]) || targetUrl;

    const summary = util.getFirst(ctx.request.query["summary"]) || '';

    const image = util.getFirst(ctx.request.query["image"]) || '';

    result["URL"] = encodeURIComponent(targetUrl);
    result["TEXT"] = encodeURIComponent(text);
    result["SUMMARY"] = encodeURIComponent(summary);
    result["IMAGE"] = encodeURIComponent(image);

    return result;
}

function getSite(ctx: KoaContext):sites.SiteData|null {
    const targetSite = util.getFirst(ctx.request.query["site"]);

    if (!targetSite) {
        sendJSON(ctx, {
            success: false,
            code: 400,
            message: "Parameter 'site' is required"
        });
        return null;
    }


    const site = sites.get(targetSite);
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

function trackEvent(ctx: KoaContext, event:trackingEvent) {
    // if you want to track clicks server-side outside of normal page logs, put the code here
}

type trackingEvent = {
    eventCategory?: string,
    eventAction?: string,
    eventLabel?: string,
    eventValue?: string
   
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

    const event:trackingEvent = {
        eventCategory: 'SHARE',
        eventAction: util.getFirst(ctx.request.query["site"]),
        eventLabel: util.getFirst(ctx.request.query["url"])
    };

    trackEvent(ctx, event);
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
        logger.info( { address: listener.address() }, 'Running');
    });
}

main();




