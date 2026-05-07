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
