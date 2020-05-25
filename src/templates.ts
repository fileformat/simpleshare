import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import * as Pino from 'pino';

const cache: Map<string, (data: object) => string> = new Map();

async function initialize(logger: Pino.Logger) {

    const dataDir = path.join(__dirname, '..', 'data');

    const fileNames = await fsPromises.readdir(dataDir);

    for (const fileName of fileNames) {
        if (fileName.endsWith(".hbs")) {
            const key = fileName.slice(0, -4);
            const templateStr = await fsPromises.readFile(path.join(dataDir, fileName), "utf-8");
            cache.set(key, Handlebars.compile(templateStr));
        }
    }

    logger.info({ templateCount: cache.size}, "templates loaded");
}

function getTemplateFn(id: string) {
    const fn = cache.get(id);
    if (!fn) {
        throw new Error(`Unknown template '${id}'!`);
    }

    return fn;
}

export {
    getTemplateFn,
    initialize
}
