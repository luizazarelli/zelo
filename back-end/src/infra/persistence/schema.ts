import { defineRelations } from 'drizzle-orm';
import * as p from 'drizzle-orm/pg-core';

export const users = p.pgTable(
    'user',
    {
        id: p.uuid().defaultRandom().primaryKey(),
        name: p.varchar().notNull(),
        createdAt: p.timestamp('created_at').defaultNow().notNull(),
        updatedAt: p.timestamp('updated_at').defaultNow().notNull(),
        email: p.varchar().unique().notNull(),
        password: p.varchar().notNull(),
        phone: p.varchar({length: 25}).notNull()
    },
    (table) => [
        p.index('user_name_idx').on(table.name),
        p.uniqueIndex('user_email_idx').on(table.email),
    ]
);

export const refreshTokens = p.pgTable(
    'refresh_tokens',
    {
        id: p.uuid().defaultRandom().primaryKey(),
        userId: p
            .uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        token: p.varchar().notNull(),
        createdAt: p.timestamp('created_at').defaultNow().notNull(),
        expiresAt: p.timestamp('expires_at').notNull(),
        isRevoked: p.boolean('is_revoked').default(false).notNull(),
    },
    (table) => [p.index('refresh_token_userid_idx').on(table.userId)]
);

export const worker = p.pgTable(
    'worker',
    {
        userId: p
            .uuid('user_id')
            .primaryKey()
            .references(() => users.id, {onDelete: "cascade"}),
        description: p.text().default("").notNull(),
        createdAt: p.timestamp('created_at').defaultNow().notNull(),
        workingSince: p.timestamp('working_since').notNull()
    }
);

export const workerServiceType = p.pgTable(
    'worker_service_type',
    {
        workerId: p
            .uuid('worker_id')
            .primaryKey()
            .references(() => worker.userId, {onDelete: "cascade"}),
        serviceTypeId: p
            .uuid('service_type_id')
            .references(() => serviceType.id, {onDelete: "cascade"})
    },
    (table) => [p.unique().on(table.workerId, table.serviceTypeId)]
)

export const serviceType  = p.pgTable(
    'service_type',
    {
        id: p
            .uuid('service_id')
            .primaryKey(),
        name: p
            .varchar({length: 20})
            .notNull(),
        description: p 
            .varchar()
            .notNull()
            .default("Sem descrição")
    }
);

export const relations = defineRelations({users, worker, workerServiceType, serviceType}, (r) => ({
    users: {
        worker: r.one.worker({
            from: r.users.id, 
            to: r.worker.userId
        })
    },
    worker: {
        users: r.one.users({
            from: r.worker.userId,
            to: r.users.id
        }),
        workerServiceType: r.many.workerServiceType({
            from: r.worker.userId,
            to: r.workerServiceType.workerId
        })
    }, 
    workerServiceType: {
        serviceType: r.one.serviceType({
            from: r.workerServiceType.serviceTypeId,
            to: r.serviceType.id
        })
    }
}))