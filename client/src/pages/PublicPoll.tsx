import { ExpiredView } from "@/components/ExpiredView";
import { ResultsView } from "@/components/ResultView";
import { VoteView } from "@/components/VoteView";
import pollService from "@/services/pollService";
import type { Poll } from "@/types/types";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

export default function PublicPoll() {
    const { pollId } = useParams();

    const [poll, setPoll] = useState<Poll | null>(null)
    const [fetching, setFetching] = useState(true);


    useEffect(() => {
        if (!pollId) return
        const load = async () => {
            try {
                const data = await pollService.publicPoll(pollId)
                setPoll(data)
            } catch {
                // poll not found
            } finally {
                setFetching(false)
            }
        }
        load()
    }, [pollId])
    
    if (fetching) return (
       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
           <div className="w-5 h-5 rounded-full border-2 border-[#333] border-t-white animate-spin" />
       </div>
   )

    if (!poll) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-[#333] text-sm">Poll not found</p>
            </div>
        )
    }

    const isExpired = new Date(poll.expiresIn) < new Date()

    if (poll.publish) return <ResultsView poll={poll} />
    if (isExpired) return <ExpiredView poll={poll} />
    return <VoteView poll={poll} />
}