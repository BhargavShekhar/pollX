import { Router }  from "express";
import PollController from "./poll.controllers.js";
import { requireAuth } from "../middleware/auth-middleware.js";

const pollController = new PollController();

const router = Router();

router.post("/vote/:pollId");

router.use(requireAuth());

router.post("/create-poll", pollController.createPollHandler.bind(pollController));
router.delete("/delete-post", pollController.deletePostHandler.bind(pollController));
router.get("/polls", pollController.allPollsHandler.bind(pollController));
router.get("/polls/:pollId", pollController.pollHandler.bind(pollController));
router.patch("/polls/:pollId/publish", pollController.publishPollHandler.bind(pollController));

export default router;