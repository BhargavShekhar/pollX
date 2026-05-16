import { and, eq, sql } from "drizzle-orm";
import ApiError from "../../common/api-error.js";
import { db } from "../../db/index.js";
import { optionsTable, pollsTable, questionsTable, votesTable } from "../../db/schema.js";
import { io } from "../../socket/index.js";
import type { createPollDto, deletePollDto, votePollDto } from "./poll.models.js";

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
                eq(pollsTable.userId, userId)
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
                        options: {
                            with: {
                                votes: true
                            }
                        }
                    }
                },
                votes: true
            }
        });

        if (!poll) throw ApiError.notfound("Poll not found");

        return poll;
    }

    async publishResult(userId: string, pollId: string) {
        const [publish] = await db.update(pollsTable).set({ publish: true }).where(and(
            eq(pollsTable.userId, userId),
            eq(pollsTable.id, pollId)
        )).returning({ id: pollsTable.id });

        if (!publish) throw ApiError.notfound("Poll not found");
    }

    async vote({
        sessionId,
        answers
    }: votePollDto,
        pollId: string,
        userId: string | undefined
    ) {
        if (!userId && !sessionId) throw ApiError.unauthorized("Can not identify user");
        if (!answers.length) throw ApiError.badRequest("At least one answer is required");

        const poll = await db.query.pollsTable.findFirst({
            where: eq(pollsTable.id, pollId),

            with: {
                questions: {
                    with: {
                        options: true
                    }
                },
                votes: true
            }
        });

        if (!poll) throw ApiError.notfound("Poll not found");

        if (poll.expiresIn < new Date()) throw ApiError.badRequest("Poll expired");

        if (poll.publish) throw ApiError.forbidden("Poll is closed");

        if (!poll.anonymousVote && userId === undefined) throw ApiError.unauthorized("Sign in required");

        const questionOptionMap = new Map<string, Set<string>>();

        for (const questions of poll.questions) {
            questionOptionMap.set(
                questions.id,
                new Set(
                    questions.options.map(option => option.id)
                )
            )
        }

        const answeredQuestion = new Set<string>();

        for (const answer of answers) {
            if (answeredQuestion.has(answer.questionId))
                throw ApiError.badRequest(`Question ${answer.questionId} answered multiple times`);

            const validOption = questionOptionMap.get(answer.questionId);

            if (!validOption)
                throw ApiError.badRequest(`Invalid question answered with question id ${answer.questionId}`);

            if (!validOption.has(answer.optionId))
                throw ApiError.badRequest(`Invalid option answered for question ${answer.questionId}`);

            answeredQuestion.add(answer.questionId);
        }

        for (const questions of poll.questions) {
            if (questions.mandatory && !answeredQuestion.has(questions.id))
                throw ApiError.badRequest(`Mandatory question ${questions.id} not answered`);
        }

        await db.transaction(async (tx) => {

            const votes = poll.votes;

            const voted = userId
                ? votes.find(vote => vote.userId === userId)
                : votes.find(vote => vote.sessionId === sessionId)

            if (voted) throw ApiError.conflict("Already voted");

            const votted = await tx.insert(votesTable).values(
                answers.map(({ optionId, questionId }) => ({
                    optionId,
                    questionId,
                    pollId: poll.id,
                    ...(userId ? { userId } : { sessionId })
                }))
            ).returning({ id: votesTable.id });

            if (votted.length !== answers.length) throw ApiError.internal("Could not vote");
        })

        const [totalVotes] = await db.select({
            count: sql<number>`count(distinct coalesce(${votesTable.userId}, ${votesTable.sessionId}))`
        })
            .from(votesTable)
            .where(eq(votesTable.pollId, pollId));

        io.to(pollId).emit("vote:new", {
            pollId,
            totalVotes: Number(totalVotes?.count ?? 0)
        });
    }

    async publicPoll(pollId: string) {
        const basePoll = await db.query.pollsTable.findFirst({
            where: eq(pollsTable.id, pollId),

            columns: {
                publish: true
            }
        });

        if (!basePoll) throw ApiError.notfound("Poll not found");

        const poll = await db.query.pollsTable.findFirst({
            where: eq(pollsTable.id, pollId),
            with: {
                questions: {
                    with: {
                        options: {
                            with: basePoll.publish ? { votes: true } : undefined
                        }
                    }
                },
                ...(basePoll.publish && {
                    votes: true
                })
            }
        });

        return poll;
    }
}

export default PollService;