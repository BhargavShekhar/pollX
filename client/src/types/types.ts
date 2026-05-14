export type UserType = {
    id: string,
    email?: string,
    name?: string
}

export type SigninPayload = {
    email: string;
    password: string;
};

export type SignupPayload = {
    name: string;
    email: string;
    password: string;
};

export type QuestionPayload = {
    question: string;
    mandatory?: boolean;
    options: string[];
};

export type CreatePollPayload = {
    title: string;
    anonymousVote: boolean;
    publish?: boolean;
    expiresIn: Date;
    questions: QuestionPayload[];
};

export type DeletePollPayload = {
    pollId: string;
};

export type AnswerPayload = {
    questionId: string;
    optionId: string;
};

export type VotePollPayload = {
    sessionId?: string;
    answers: AnswerPayload[];
};