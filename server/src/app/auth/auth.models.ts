import { z } from "zod";

export const signupPayloadModel = z.object({
    name: z.string().min(2).max(45),
    email: z.email(),
    password: z.string().min(6)
})

export const signinPayloadModel = z.object({
    email: z.email(),
    password: z.string().min(6)
})

export type signupDto = z.infer<typeof signupPayloadModel>;
export type signinDto = z.infer<typeof signinPayloadModel>;