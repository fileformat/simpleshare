import * as comparison from './comparison';

async function sitemap(ctx: any) {

    let urls: string[] = [];

    urls.push(...comparison.getUrls());

    // hard-coded to avoid circular dependencies
    urls.push("/index.html");
    urls.push("/linkbuilder.html");

    urls.sort();

    await ctx.render('sitemap.hbs', { urls });
    ctx.type = "text/xml;charset=utf-8";
}

export {
    sitemap
}