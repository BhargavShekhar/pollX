import { and, eq } from "drizzle-orm";
import ApiError from "../../common/api-error.js";
import { db } from "../../db/index.js";
import { optionsTable, pollsTable, questionsTable, usersTable } from "../../db/schema.js";
import type { createPollDto, deletePollDto } from "./poll.models.js";

class PollService {
    async createPoll({
        anonymousVote,
        expiresIn,
        publish,
        questions,
        title
    }: createPollDto,
        userId: string
    ) {
        const pollId = await db.transaction(async (tx) => {
            const [createdPoll] = await tx.insert(pollsTable).values({
                userId,
                title,
                anonymousVote,
                publish,
                expiresIn
            }).returning({ id: pollsTable.id });

            if (!createdPoll) throw ApiError.internal("Could not create poll");

            for (const q of questions) {
                const [createdQuestion] = await tx.insert(questionsTable).values({
                    pollId: createdPoll.id,
                    question: q.question,
                    mandatory: q.mandatory
                }).returning({ id: questionsTable.id });

                if (!createdQuestion) throw ApiError.internal("Could not add question");

                await tx.insert(optionsTable).values(
                    q.options.map(option => ({
                        questionId: createdQuestion.id,
                        option
                    }))
                )
            }

            return createdPoll;
        });

        return pollId;
    }

    async deletePoll({ pollId }: deletePollDto, userId: string) {
        const [deleted] = await db.delete(pollsTable).where(
            and(
                eq(pollsTable.id, pollId),
                eq(usersTable.id, userId)
            )
        ).returning({ id: pollsTable.id });

        if (!deleted) throw ApiError.notfound("Poll not found");
    }

    async allPolls(userId: string) {
        const polls = await db.select().from(pollsTable).where(
            eq(pollsTable.userId, userId)
        )
        return polls;
    }

    async poll(userId: string, pollId: string) {
        const poll = await db.query.pollsTable.findFirst({
            where: and(
                eq(pollsTable.userId, userId),
                eq(pollsTable.id, pollId)
            ),

            with: {
                questions: {
                    with: {
                        options: true
                    }
                },
                votes: true
            }
        });

        return poll;
    }

    async publish(userId: string, pollId: string) {
        const [publish] = await db.update(pollsTable).set({ publish: true }).where(and(
            eq(pollsTable.userId, userId),
            eq(pollsTable.id, pollId)
        )).returning({ id: pollsTable.id });

        if (!publish) throw ApiError.notfound("Poll not found");
    }

    async vote(pollId: string, userId: string | undefined) {
        const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId));

        if (!poll) throw ApiError.notfound("Poll not found");

        if (poll.expiresIn < new Date()) throw ApiError.badRequest("Poll expired");

        if (!poll.publish) throw ApiError.forbidden("Poll not published");

        if (!poll.anonymousVote && userId === undefined) throw ApiError.unauthorized("Sign in required");

        
    }
}

export default PollService;