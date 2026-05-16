import ApiError from "../../common/api-error.js";
import ApiResponse from "../../common/api-response.js";
import { createPollPayload, deletePollPayload, votePollPayload } from "./poll.models.js";
import PollService from "./poll.services.js";
import type { Request, Response } from "express";

class PollController {
    private pollService = new PollService();

    public async createPollHandler(req: Request, res: Response) {
        const validateData = createPollPayload.safeParse(req.body);

        if (!validateData.success) throw ApiError.badRequest("Validation failed");

        const data = validateData.data;

        const userId = req.user!.id;

        const result = await this.pollService.createPoll(data, userId);

        return ApiResponse.created(res, "Poll created successfully", result);
    }

    public async deletePollHandler(req: Request, res: Response) {
        const validateData = deletePollPayload.safeParse(req.body);

        if (!validateData.success) throw ApiError.badRequest("Validation failed");

        const data = validateData.data;

        const userId = req.user!.id;

        await this.pollService.deletePoll(data, userId);

        return ApiResponse.ok(res, "Poll deleted successfully");
    }

    public async allPollsHandler(req: Request, res: Response) {
        const userId = req.user!.id;

        const result = await this.pollService.allPolls(userId);

        return ApiResponse.ok(res, "Polls fetched successfully", result);
    }

    public async pollHandler(req: Request, res: Response) {
        const pollId = req.params.pollId;

        if (!pollId || typeof pollId !== "string") throw ApiError.badRequest("Could not get pollId");

        const userId = req.user!.id;

        const result = await this.pollService.poll(userId, pollId);

        return ApiResponse.ok(res, "Polls fetched successfully", result);
    }

    public async publishPollHandler(req: Request, res: Response) {
        const pollId = req.params.pollId;

        if (!pollId || typeof pollId !== "string") throw ApiError.badRequest("Could not get pollId");

        const userId = req.user!.id;

        await this.pollService.publishResult(userId, pollId);

        return ApiResponse.ok(res, "Poll publish successfully");
    }

    public async voteHandler(req: Request, res: Response) {
        const pollId = req.params.pollId;
        
        if (!pollId || typeof pollId !== "string") throw ApiError.badRequest("Could not get pollId");
        
        const userId = req.user?.id; 

        const validateData = votePollPayload.safeParse(req.body);

        if (!validateData.success) throw ApiError.badRequest("Validation failed");

        await this.pollService.vote(validateData.data, pollId, userId);

        return ApiResponse.ok(res, "Votted successfully");
    }

    public async publicPollHandler(req: Request, res: Response) {
        const pollId = req.params.pollId;

        if (!pollId || typeof pollId !== "string") throw ApiError.badRequest("Could not get pollId");

        const result = await this.pollService.publicPoll(pollId);

        return ApiResponse.ok(res, "Polls fetched successfully", result);
    }
}

export default PollController;