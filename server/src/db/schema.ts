import { pgTable, varchar, uuid, boolean, text, timestamp } from "drizzle-orm/pg-core";

// TODO can index all the foregin key
export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 }).notNull().unique(),

    password: varchar("password", { length: 66 }),

    refreshToken: varchar("refresh_token", { length: 255 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$default(() => new Date())
});

export const pollsTable = pgTable("polls", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 255 }).notNull(),

    anonymousVote: boolean("anonymous_vote").default(false),

    publish: boolean("publish").default(false),

    expiresIn: timestamp("expires_in").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$default(() => new Date())
});

export const questionsTable = pgTable("questions", {
    id: uuid("id").primaryKey().defaultRandom(),

    question: text("question").notNull(),

    pollId: uuid("poll_id")
        .notNull()
        .references(() => pollsTable.id, { onDelete: "cascade" }),

    mandatory: boolean("mandatory").default(false)
});

export const optionsTable = pgTable("options", {
    id: uuid("id").primaryKey().defaultRandom(),

    option: varchar("option", { length: 500 }).notNull(),

    questionId: uuid("question_id")
        .notNull()
        .references(() => questionsTable.id, { onDelete: "cascade" }),
});

export const votesTable = pgTable("votes", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" }),

    sessionId: uuid("session_id"),

    optionId: uuid("option_id")
        .notNull()
        .references(() => optionsTable.id, { onDelete: "cascade" }),

    questionId: uuid("question_id")
        .notNull()
        .references(() => questionsTable.id, { onDelete: "cascade" }),

    pollId: uuid("poll_id")
        .notNull()
        .references(() => pollsTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$default(() => new Date())
});