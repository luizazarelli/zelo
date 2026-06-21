import { defineRelations } from 'drizzle-orm';
import * as p from 'drizzle-orm/pg-core';

export const users = p.pgTable(
    'users',
    {
        id: p.uuid().defaultRandom().primaryKey(),
        name: p.varchar().notNull(),
        createdAt: p.timestamp('created_at').defaultNow().notNull(),
        updatedAt: p.timestamp('updated_at').defaultNow().notNull(),
        email: p.varchar().unique().notNull(),
        password: p.varchar().notNull(),
        phone: p.varchar({length: 25}).notNull(),
        profilePicture: p.varchar('profile_picture'),
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

export const hire = p.pgTable('hire', {
    id: p.uuid().defaultRandom().primaryKey(),
    clientId: p.uuid('client_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    workerId: p.uuid('worker_id').references(() => worker.userId, { onDelete: 'cascade' }).notNull(),
    serviceTypeId: p.uuid('service_type_id').references(() => serviceType.id, { onDelete: 'cascade' }).notNull(),
    description: p.text().notNull().default(''),
    status: p.varchar({ length: 20 }).notNull().default('pending'),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
    updatedAt: p.timestamp('updated_at').defaultNow().notNull(),
});

export const message = p.pgTable('message', {
    id: p.uuid().defaultRandom().primaryKey(),
    hireId: p.uuid('hire_id').references(() => hire.id, { onDelete: 'cascade' }).notNull(),
    senderId: p.uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: p.text().notNull(),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
});

export const workerPhotos = p.pgTable('worker_photos', {
    id: p.uuid().defaultRandom().primaryKey(),
    workerId: p.uuid('worker_id').references(() => worker.userId, { onDelete: 'cascade' }).notNull(),
    url: p.varchar().notNull(),
    position: p.integer().notNull().default(0),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
});

export const payment = p.pgTable('payment', {
    id: p.uuid().defaultRandom().primaryKey(),
    hireId: p.uuid('hire_id').references(() => hire.id, { onDelete: 'cascade' }).notNull().unique(),
    amount: p.doublePrecision().notNull(),
    status: p.varchar({ length: 20 }).notNull().default('pending'),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
    paidAt: p.timestamp('paid_at'),
});

export const proposal = p.pgTable('proposal', {
    id: p.uuid().defaultRandom().primaryKey(),
    hireId: p.uuid('hire_id').references(() => hire.id, { onDelete: 'cascade' }).notNull(),
    authorId: p.uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    amount: p.doublePrecision().notNull(),
    round: p.integer().notNull(),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    p.index('proposal_hire_id_idx').on(table.hireId),
])

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