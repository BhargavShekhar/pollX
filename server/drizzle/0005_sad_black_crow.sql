CREATE INDEX "options_question_id_idx" ON "options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_poll_id_idx" ON "questions" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "votes_user_id_idx" ON "votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "votes_option_id_idx" ON "votes" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "votes_question_id_idx" ON "votes" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "votes_poll_id_idx" ON "votes" USING btree ("poll_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_user_id_unique" UNIQUE("poll_id","user_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_session_id_unique" UNIQUE("poll_id","session_id");