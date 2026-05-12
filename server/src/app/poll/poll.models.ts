import { z } from "zod";

const questionSchema = z.object({
    question: z.string().min(1),
    mandatory: z.boolean().default(false),
    options: z.array(z.string())
});

export const createPollPayload = z.object({
    title: z.string().min(1),
    anonymousVote: z.boolean(),
    publish: z.boolean().default(false),
    expiresIn: z.date().refine(date => date >= new Date(), {
        message: "Date cannot be in the past"
    }),
    questions: z.array(questionSchema)
})

export const deletePollPayload = z.object({
    pollId: z.uuid()
})

export type createPollDto = z.infer<typeof createPollPayload>;
export type deletePollDto = z.infer<typeof deletePollPayload>;