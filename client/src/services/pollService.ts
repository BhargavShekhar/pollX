import type { CreatePollPayload, DeletePollPayload, VotePollPayload } from "@/types/types";
import { api } from "./api";

class PollService {
    async createPoll({
        anonymousVote,
        expiresIn,
        questions,
        title,
        publish
    }: CreatePollPayload) {
        const { data } = await api.post("/poll/create-poll", {
            anonymousVote,
            expiresIn,
            questions,
            title,
            publish
        })

        return data.data;
    }

    async deletePoll({ pollId }: DeletePollPayload) {
        const { data } = await api.delete("/poll/delete-poll", {
            data: { pollId }
        }
        );

        return data.data;
    }

    async allPolls() {
        const { data } = await api.get("/poll/polls");

        return data.data;
    }

    async poll(pollId: string) {
        const { data } = await api.get(`/poll/polls/${pollId}`);

        return data.data;
    }

    async publishPoll(pollId: string) {
        const { data } = await api.patch(`/poll/polls/${pollId}/publish`);

        return data.data;
    }

    async vote(
        pollId: string,
        {
            answers,
            sessionId
        }: VotePollPayload
    ) {

        const { data } = await api.post(`/poll/${pollId}/vote`, {
            answers,
            sessionId
        });

        return data.data;
    }
}

export default PollService;