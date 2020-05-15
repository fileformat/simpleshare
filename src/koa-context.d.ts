/*
 * typescript isn't finding the correct additions to Koa's context
 */

import { ExtendableContext } from 'koa';
import { Logger } from 'pino';

declare module 'koa' {
    interface ExtendableContext {
        render(viewPath: string, locals?: any): Promise<void>;
        //log: Logger;
        isAuthenticated(): boolean;
        logger: Logger;
        login(user: any, options?: any): Promise<void>;
        logout(): void;
     }
}
