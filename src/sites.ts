import { promises as fsPromises } from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
import * as Pino from 'pino';

type SiteData = {
    id: string,
    logo_handle: string,
    logo_link: string,
    logo_url: string,
    name: string,
    template: string,
    templateFn: (data:object) => string,
};


const cache = new Map<string, SiteData>();
const sites:SiteData[] = [];

async function initialize(logger: Pino.Logger) {
    const sitesFileName = path.join(__dirname, '..', 'data', 'sites.json');
    const rawStr = await fsPromises.readFile(sitesFileName, 'utf-8');
    if (rawStr instanceof Buffer) {
        throw new Error('should not happen if encodeing is set in readFile');
    }
    const rawData = JSON.parse(rawStr);

    for (const rawSite of rawData) {
        const site = {
            id: rawSite.id,
            logo_url: `https://www.vectorlogo.zone/logos/${rawSite.logo}/${rawSite.logo}-tile.svg`,
            logo_handle: rawSite.logo,
            logo_link: `https://www.vectorlogo.zone/logos/${rawSite.logo}/index.html`,
            name: rawSite.name,
            template: rawSite.template,
            templateFn: Handlebars.compile(rawSite.template)
        }
        sites.push(site);
        cache.set(site.id, site);
    }

    logger.info({ siteCount: sites.length }, 'sites loaded');
}

function get(id:string):SiteData|undefined {
    return cache.get(id);
}

function getAll():SiteData[] {
    return sites;
}

export {
    initialize,
    get,
    getAll,
    SiteData,
}
