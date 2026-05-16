ALTER TABLE "votes" DROP CONSTRAINT "votes_poll_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_poll_id_session_id_unique";--> statement-breakpoint
CREATE INDEX "vote_session_id_idx" ON "votes" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "vote_poll_user_question_unique" UNIQUE("poll_id","user_id","question_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "vote_poll_session_question_unique" UNIQUE("poll_id","session_id","question_id");