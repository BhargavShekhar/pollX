import pollService from "@/services/pollService"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

type Poll = {
    id: string
    title: string
    anonymousVote: boolean
    publish: boolean
    expiresIn: string
    createdAt: string
    _count?: { votes: number }
}

function timeLeft(expiresIn: string) {
    const diff = new Date(expiresIn).getTime() - Date.now()
    if (diff <= 0) return "Expired"
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `${days}d left`
    if (hours > 0) return `${hours}h left`
    return "< 1h left"
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function PollCard({ poll, onDelete }: { poll: Poll; onDelete: (id: string) => void }) {

    const navigate = useNavigate()
    const isExpired = new Date(poll.expiresIn) < new Date()
    const tLeft = timeLeft(poll.expiresIn)

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`)
        toast.success("Link copied")
    }

    const handlePublish = async () => {
        try {
            await pollService.publishPoll(poll.id);

            toast.success("Poll published");
        } catch (error) {
            toast.error("Could not publish poll");
        }
    }

    const handleDelete = async () => {
        try {
            await pollService.deletePoll({ pollId: poll.id });

            onDelete(poll.id)
            toast.success("Poll deleted")
        } catch (error) {
            toast.error("Could not delete")
        }
    }



    return (
        <div className="group bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#2a2a2a] transition-colors">
            {/* top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate leading-snug">{poll.title}</h3>
                    <p className="text-[#444] text-xs mt-1">{formatDate(poll.createdAt)}</p>
                </div>
                {/* status badge */}
                <div className="shrink-0">
                    {poll.publish ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#22c55e12] text-[#22c55e] border border-[#22c55e22]">
                            Published
                        </span>
                    ) : isExpired ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ef444412] text-[#ef4444] border border-[#ef444422]">
                            Expired
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ffffff08] text-[#666] border border-[#1f1f1f]">
                            {tLeft}
                        </span>
                    )}
                </div>
            </div>

            {/* stats row */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-[#555] text-xs">{poll._count?.votes ?? 0} responses</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {poll.anonymousVote ? (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                            <span className="text-[#555] text-xs">Anonymous</span>
                        </>
                    ) : (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            <span className="text-[#555] text-xs">Authenticated</span>
                        </>
                    )}
                </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#1a1a1a]">
                <button
                    onClick={copyLink}
                    title="Copy share link"
                    className="flex items-center gap-1.5 text-[#555] hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-all"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy link
                </button>

                <button
                    onClick={() => navigate(`/polls/${poll.id}`)}
                    title="View analytics"
                    className="flex items-center gap-1.5 text-[#555] hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-all"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Analytics
                </button>

                {!poll.publish && (
                    <button
                        onClick={handlePublish}
                        title="Publish results"
                        className="flex items-center gap-1.5 text-[#555] hover:text-[#22c55e] text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#22c55e0a] transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 8 12 12 14 14" />
                        </svg>
                        Publish
                    </button>
                )}

                <button
                    onClick={handleDelete}
                    title="Delete poll"
                    className="ml-auto flex items-center gap-1.5 text-[#555] hover:text-[#ef4444] text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#ef44440a] transition-all"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    )
}