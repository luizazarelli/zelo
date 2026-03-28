import { Config } from '@common/env.config';
import type { FastifyReply } from 'fastify';

class CookieProvider {
    static setCookie({
        key,
        data,
        expiresAt,
        reply,
    }: {
        key: string;
        data: string;
        expiresAt: Date;
        reply: FastifyReply;
    }) {
        reply.cookie(key, data, {
            domain: Config.env.FRONTEND_DOMAIN,
            path: '/',
            expires: expiresAt,
            httpOnly: true,
            sameSite: 'strict',
            secure: Config.env.NODE_ENV === 'production',
        });
    }
}

export { CookieProvider };
