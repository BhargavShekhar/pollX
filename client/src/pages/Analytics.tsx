import pollService from "@/services/pollService"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

type Option = { id: string; option: string; votes: { id: string }[] }
type Question = { id: string; question: string; mandatory: boolean; options: Option[] }
type Poll = {
    id: string
    title: string
    anonymousVote: boolean
    publish: boolean
    expiresIn: string
    createdAt: string
    questions: Question[]
    votes: { id: string }[]
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
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    })
}

function QuestionCard({ question, index, totalVotes }: {
    question: Question
    index: number
    totalVotes: number
}) {
    const questionVotes = question.options.reduce((a, o) => a + o.votes.length, 0)
    const skipped = totalVotes - questionVotes
    const winner = question.options.reduce((a, b) => a.votes.length > b.votes.length ? a : b)

    return (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#444] text-xs font-medium">Q{index + 1}</span>
                        {question.mandatory ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffffff08] border border-[#1f1f1f] text-[#555]">
                                Mandatory
                            </span>
                        ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffffff04] border border-[#1a1a1a] text-[#333]">
                                Optional
                            </span>
                        )}
                    </div>
                    <p className="text-white text-sm font-medium leading-snug">{question.question}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-white text-lg font-semibold">{questionVotes}</p>
                    <p className="text-[#444] text-xs">responses</p>
                </div>
            </div>

            <div className="space-y-3">
                {question.options
                    .sort((a, b) => b.votes.length - a.votes.length)
                    .map(option => {
                        const pct = questionVotes === 0 ? 0 : Math.round((option.votes.length / questionVotes) * 100)
                        const isWinner = option.id === winner.id && option.votes.length > 0
                        return (
                            <div key={option.id} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {isWinner && (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#eab308" stroke="none">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        )}
                                        <span className="text-sm text-[#ccc]">{option.option}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#555] text-xs">{option.votes.length}</span>
                                        <span className="text-white text-xs font-medium w-8 text-right">{pct}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${pct}%`,
                                            background: isWinner
                                                ? "linear-gradient(90deg, #ffffff40, #ffffff)"
                                                : "#2a2a2a",
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
            </div>

            {!question.mandatory && skipped > 0 && (
                <p className="text-[#333] text-xs border-t border-[#1a1a1a] pt-3">
                    {skipped} respondent{skipped !== 1 ? "s" : ""} skipped this question
                </p>
            )}
        </div>
    )
}

export default function Analytics() {
    const { pollId } = useParams()
    const navigate = useNavigate()
    const [poll, setPoll] = useState<Poll | null>(null)
    const [fetching, setFetching] = useState(true)
    const [publishing, setPublishing] = useState(false)

    useEffect(() => {
        if (!pollId) return

        const load = async () => {
            try {
                const data = await pollService.poll(pollId)
                setPoll(data)
            } catch {
                toast.error("Failed to load poll")
            } finally {
                setFetching(false)
            }
        }

        load()
    }, [pollId])

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/p/${poll?.id}`)
        toast.success("Link copied")
    }

    const handlePublish = async () => {
        if (!pollId) return
        setPublishing(true)
        try {
            await pollService.publishPoll(pollId)
            setPoll(prev => prev ? { ...prev, publish: true } : prev)
            toast.success("Results published")
        } catch {
            toast.error("Failed to publish")
        } finally {
            setPublishing(false)
        }
    }

    if (fetching) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#333] border-t-white animate-spin" />
        </div>
    )

    if (!poll) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <p className="text-[#333] text-sm">Poll not found</p>
        </div>
    )

    const totalVotes = poll.votes.length
    const isExpired = new Date(poll.expiresIn) < new Date()

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            {/* navbar */}
            <nav className="relative border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#0a0a0a]" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Pollx</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyLink}
                        className="text-[#555] hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all flex items-center gap-1.5"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Share
                    </button>
                    {!poll.publish && (
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="flex items-center gap-1.5 bg-white text-[#0a0a0a] text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-[#e5e5e5] transition-colors disabled:opacity-40"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            {publishing ? "Publishing..." : "Publish results"}
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-[#555] hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all"
                    >
                        ← Back
                    </button>
                </div>
            </nav>

            <main className="relative max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
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
                                {timeLeft(poll.expiresIn)}
                            </span>
                        )}
                        {poll.anonymousVote && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ffffff06] text-[#444] border border-[#1a1a1a]">
                                Anonymous
                            </span>
                        )}
                    </div>
                    <h1 className="text-white text-2xl font-semibold tracking-tight">{poll.title}</h1>
                    <p className="text-[#444] text-sm mt-1">Created {formatDate(poll.createdAt)} · Expires {formatDate(poll.expiresIn)}</p>
                </div>

                {/* stats row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: "Total responses", value: totalVotes },
                        { label: "Questions", value: poll.questions.length },
                        {
                            label: "Completion rate",
                            value: `${poll.questions.length > 0
                                ? Math.round(
                                    poll.questions.filter(q => q.mandatory).length === 0 ? 100
                                        : (poll.questions
                                            .filter(q => q.mandatory)
                                            .reduce((a, q) => a + q.options.reduce((b, o) => b + o.votes.length, 0), 0) /
                                            (poll.questions.filter(q => q.mandatory).length * Math.max(totalVotes, 1))) * 100
                                )
                                : 0}%`,
                        },
                    ].map(stat => (
                        <div key={stat.label} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-4">
                            <p className="text-white text-2xl font-semibold">{stat.value}</p>
                            <p className="text-[#444] text-xs mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* live indicator */}
                {!isExpired && !poll.publish && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                        </span>
                        <span className="text-[#22c55e] text-xs">Live — updates in real time</span>
                    </div>
                )}

                <div className="space-y-4">
                    {poll.questions.map((q, i) => (
                        <QuestionCard key={q.id} question={q} index={i} totalVotes={totalVotes} />
                    ))}
                </div>
            </main>
        </div>
    )
}