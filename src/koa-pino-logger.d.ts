// Type definitions for koa-pino-logger 2.1
// Project: https://github.com/pinojs/koa-pino-logger
// Definitions by: Cameron Yan <https://github.com/khell>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

/// <reference types="node"/>
declare module 'koa-pino-logger' {

    import { Middleware } from 'koa';
    import { BaseLogger, LoggerOptions, Logger, Level } from 'pino';
    import * as stream from 'stream';
    import * as http from 'http';

    export = logger;

    function logger(
        opts?: logger.HttpLoggerOptions,
        stream?: stream.Writable | stream.Duplex | stream.Transform
    ): Middleware;

    namespace logger {
        interface HttpLoggerOptions extends LoggerOptions {
            logger?: Logger;
            genReqId?(req: http.IncomingMessage): number;
            useLevel?: Level;
            stream?: stream.Writable | stream.Duplex | stream.Transform;
        }
    }

    module 'koa' {
        interface Context {
            log:Logger;
        }
    }

}
