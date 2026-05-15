import { and, eq } from "drizzle-orm";
import ApiError from "../../common/api-error.js";
import { db } from "../../db/index.js";
import { optionsTable, pollsTable, questionsTable, usersTable, votesTable } from "../../db/schema.js";
import { io } from "../../socket/index.js";
import type { answersDto, createPollDto, deletePollDto, votePollDto } from "./poll.models.js";

type ValidatePoll = Awaited<ReturnType<PollService["validateAnswers"]>>;

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

        return poll;
    }

    async publish(userId: string, pollId: string) {
        const [publish] = await db.update(pollsTable).set({ publish: true }).where(and(
            eq(pollsTable.userId, userId),
            eq(pollsTable.id, pollId)
        )).returning({ id: pollsTable.id });

        if (!publish) throw ApiError.notfound("Poll not found");
    }

    async validateAnswers(pollId: string, answers: answersDto[]) {
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

        const questionOptionMap = new Map<string, Set<string>>();

        for (const question of poll.questions) {
            questionOptionMap.set(
                question.id,
                new Set(
                    question.options.map(option => option.id)
                )
            )
        }

        const answeredQuestions = new Set<string>();

        for (const answer of answers) {
            if (answeredQuestions.has(answer.questionId)) throw ApiError.badRequest("Duplicate question answered");

            answeredQuestions.add(answer.questionId);

            const validOptions = questionOptionMap.get(answer.questionId);

            if (!validOptions) throw ApiError.badRequest(`Invalid question: ${answer.questionId}`);

            if (!validOptions.has(answer.optionId)) throw ApiError.badRequest(`Invalid option for question ${answer.questionId}`);
        }

        return poll;
    }

    async anonymousVote(sessionId: string, poll: ValidatePoll, answers: answersDto[]) {
        await db.transaction(async (tx) => {
            const votes = poll.votes;

            const voted = votes.find(vote => vote.sessionId === sessionId);

            if (voted) throw ApiError.conflict("Already voted");

            const votted = await tx.insert(votesTable).values(
                answers.map(({ optionId, questionId }) => ({
                    optionId,
                    questionId,
                    pollId: poll.id,
                    sessionId
                }))
            ).returning({ id: votesTable.id });

            if (votted.length !== answers.length) throw ApiError.internal("Could not vote");
        })
    }

    async userVote(userId: string, poll: ValidatePoll, answers: answersDto[]) {
        await db.transaction(async (tx) => {

            const votes = poll.votes;

            const voted = votes.find(vote => vote.userId === userId);

            if (voted) throw ApiError.conflict("Already voted");

            const votted = await tx.insert(votesTable).values(
                answers.map(({ optionId, questionId }) => ({
                    optionId,
                    questionId,
                    pollId: poll.id,
                    userId
                }))
            ).returning({ id: votesTable.id });

            if (votted.length !== answers.length) throw ApiError.internal("Could not vote");
        })
    }

    async vote({
        sessionId,
        answers
    }: votePollDto,
        pollId: string,
        userId: string | undefined
    ) {

        const poll: ValidatePoll = await this.validateAnswers(pollId, answers);

        if (poll.expiresIn < new Date()) throw ApiError.badRequest("Poll expired");

        if (poll.publish) throw ApiError.forbidden("Poll is closed");

        if (!poll.anonymousVote && userId === undefined) throw ApiError.unauthorized("Sign in required");

        if (userId) await this.userVote(userId, poll, answers);
        if (sessionId && !userId) await this.anonymousVote(sessionId, poll, answers);

        io.to(pollId).emit("vote:new", {
            pollId,
            totalVotes: poll.votes.length + 1
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