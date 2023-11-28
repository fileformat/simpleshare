import * as Koa from 'koa';

import * as sites from './sites';
import * as templates from './templates';

async function linkBuilder(ctx:Koa.ExtendableContext) {
    const text = ctx.request.query.text;
    const url = ctx.request.query.url;
    const checkParams = ctx.request.query.site || [];
    const checks = Array.isArray(checkParams) ? checkParams : [ checkParams ];

    let results:string|undefined;

    if (url && checks.length > 0) {
        const shares:any[] = []
        for (const check of checks) {
            const site = sites.get(check);
            if (!site) {
                continue;
            }
            //https://simpleshare.dev/go?site={{this.id}}&url={{encodeURIComponent this.url}}&text={{encodeURIComponent this.text}}
            shares.push({
                id: site.id,
                name: site.name,
                logo_url: site.logo_url,
                url: site.templateFn({URL: url, TEXT: text || url}),
            });
        }
        results = templates.getTemplateFn("html")({
            shares
        });
    }

    await ctx.render('linkbuilder.hbs', {
        checks,
        results,
        sites: sites.getAll(),
        text,
        title: 'Link Builder',
        url,
    });
}

export {
    linkBuilder
}