import Handlebars from 'handlebars';
import rawData from '../data/sites.json';

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

for (const rawSite of rawData) {
        const site = {
            id: rawSite.id,
            logo_url: `https://cdn.simpleshare.dev/tile/${rawSite.id}-tile.svg`,
            logo_handle: rawSite.logo,
            logo_link: `https://www.vectorlogo.zone/logos/${rawSite.vectorlogozone}/index.html`,
            name: rawSite.name,
            template: rawSite.template,
            templateFn: Handlebars.compile(rawSite.template)
        }
        sites.push(site);
        cache.set(site.id, site);
}

function get(id:string):SiteData|undefined {
    return cache.get(id);
}

function getAll():SiteData[] {
    return sites;
}

export {
    get,
    getAll,
    SiteData,
}
