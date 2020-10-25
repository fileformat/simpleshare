import { promises as fsPromises } from 'fs';
import KoaRouter from 'koa-router';
import * as path from 'path';
import Pino from 'pino';

const comparisonRouter = new KoaRouter();




let comparisonData: any;

async function initialize(logger: Pino.Logger) {
    comparisonData = JSON.parse((await fsPromises.readFile(path.join(__dirname, '..', 'data', 'comparison.json'), 'utf-8')) as string);

    logger.info({ comparisonCount: comparisonData.length}, "Comparison sites loaded");
}

comparisonRouter.get('/comparison/index.html', async (ctx) => {
    await ctx.render('comparison/index.hbs', {
        data: comparisonData,
        title: 'Social Linking Site Comparison',
    });
});

comparisonRouter.get('/comparison/:slug/index.html', async (ctx) => {

    const slug = ctx.params.slug;

    const data = comparisonData.filter( (site:any) => site.slug === slug );
    if (!data || data.length == 0) {
        ctx.redirect('/comparison/index.html');
        return;
    }

    console.log(JSON.stringify(data));

    await ctx.render('comparison/_index.hbs', {
        data: data[0],
        nocompare: slug == 'simpleshare_io',
        title: slug == 'simpleshare_io' ? data[0].name : `SimpleShare.IO vs ${data[0].name}`,
    });
});

function getUrls():string[] {
    const urls:string[] = [];

    urls.push(`/comparison/index.html`);
    for (const site of comparisonData) {
        if (site.slug) {
            urls.push(`/comparison/${site.slug}/index.html`);
        }
    }
    return urls;
}

export {
    initialize,
    comparisonRouter,
    getUrls,
}
