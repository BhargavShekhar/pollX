import { relations } from "drizzle-orm";
import {
    optionsTable,
    pollsTable,
    questionsTable,
    usersTable,
    votesTable
} from "./schema.js";

export const usersRelation = relations(usersTable, ({ many }) => ({
    polls: many(pollsTable),

    votes: many(votesTable)
}));

export const pollsRelation = relations(pollsTable, ({ one, many }) => ({
    creator: one(usersTable, {
        fields: [pollsTable.userId],
        references: [usersTable.id]
    }),

    questions: many(questionsTable),

    votes: many(votesTable)
}));

export const questionsRelation = relations(questionsTable, ({ one, many }) => ({
    poll: one(pollsTable, {
        fields: [questionsTable.pollId],
        references: [pollsTable.id]
    }),

    options: many(optionsTable),

    votes: many(votesTable)
}));

export const optionsRelation = relations(optionsTable, ({ one, many }) => ({
    question: one(questionsTable, {
        fields: [optionsTable.questionId],
        references: [questionsTable.id]
    }),

    votes: many(votesTable)
}))

export const votesRelation = relations(votesTable, ({ one }) => ({
    poll: one(pollsTable, {
        fields: [votesTable.pollId],
        references: [pollsTable.id]
    }),

    question: one(questionsTable, {
        fields: [votesTable.questionId],
        references: [questionsTable.id]
    }),

    option: one(optionsTable, {
        fields: [votesTable.optionId],
        references: [optionsTable.id]
    }),

    user: one(usersTable, {
        fields: [votesTable.userId],
        references: [usersTable.id]
    })
}))