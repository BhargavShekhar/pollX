import pollService from "@/services/pollService";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
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

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
}

// ── Results view (published) ──────────────────────────────────────────────────
function ResultsView({ poll }: { poll: Poll }) {
    const totalVotes = poll.votes.length

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="relative max-w-xl mx-auto px-5 py-12">
                {/* logo */}
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#0a0a0a]" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Pollx</span>
                </div>

                {/* header */}
                <div className="mb-8">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#22c55e12] text-[#22c55e] border border-[#22c55e22]">
                        Results published
                    </span>
                    <h1 className="text-white text-2xl font-semibold tracking-tight mt-3">{poll.title}</h1>
                    <p className="text-[#444] text-sm mt-1">{totalVotes} total responses · Closed {formatDate(poll.expiresIn)}</p>
                </div>

                {/* question results */}
                <div className="space-y-4">
                    {poll.questions.map((q, i) => {
                        const questionVotes = q.options.reduce((a, o) => a + o.votes.length, 0)
                        const winner = q.options.reduce((a, b) => a.votes.length > b.votes.length ? a : b)

                        return (
                            <div key={q.id} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-[#444] text-xs">Q{i + 1}</span>
                                        <p className="text-white text-sm font-medium mt-0.5">{q.question}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-white font-semibold">{questionVotes}</p>
                                        <p className="text-[#444] text-xs">votes</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {q.options
                                        .sort((a, b) => b.votes.length - a.votes.length)
                                        .map(option => {
                                            const pct = questionVotes === 0 ? 0 : Math.round((option.votes.length / questionVotes) * 100)
                                            const isWinner = option.id === winner.id && option.votes.length > 0
                                            return (
                                                <div key={option.id} className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            {isWinner && (
                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="#eab308">
                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                </svg>
                                                            )}
                                                            <span className="text-sm text-[#ccc]">{option.option}</span>
                                                        </div>
                                                        <span className="text-white text-xs font-medium">{pct}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{
                                                                width: `${pct}%`,
                                                                background: isWinner ? "linear-gradient(90deg, #ffffff40, #ffffff)" : "#2a2a2a",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-center text-[#2a2a2a] text-xs mt-10">
                    Powered by Pollx
                </p>
            </div>
        </div>
    )
}

// ── Expired view ──────────────────────────────────────────────────────────────
function ExpiredView({ poll }: { poll: Poll }) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
            <div className="text-center max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <h2 className="text-white text-lg font-semibold">Poll closed</h2>
                <p className="text-[#444] text-sm mt-2">
                    <span className="font-medium text-[#666]">{poll.title}</span> is no longer accepting responses.
                </p>
                <p className="text-[#333] text-xs mt-4">Ended {formatDate(poll.expiresIn)}</p>
            </div>
        </div>
    )
}

// ── Voting form ───────────────────────────────────────────────────────────────
function VoteView({ poll }: { poll: Poll }) {
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const selectOption = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }

    const handleSubmit = async () => {
        // validate mandatory
        for (const q of poll.questions) {
            if (q.mandatory && !answers[q.id]) {
                toast.error(`"${q.question}" is required`)
                return
            }
        }

        const payload = {
            sessionId: (() => {
                let sid = localStorage.getItem("pollx_session_id")
                if (!sid) {
                    sid = crypto.randomUUID()
                    localStorage.setItem("pollx_session_id", sid)
                }
                return sid
            })(),
            answers: Object.entries(answers).map(([questionId, optionId]) => ({
                questionId,
                optionId,
            })),
        }

        setLoading(true)
        try {
            await pollService.vote(poll.id, payload);
            console.log("vote payload", payload)
            await new Promise(r => setTimeout(r, 800)) // simulate
            setSubmitted(true)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to submit")
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-5">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-white text-lg font-semibold">Response submitted</h2>
                    <p className="text-[#444] text-sm mt-2">Thanks for participating in <span className="text-[#666]">{poll.title}</span></p>
                </div>
            </div>
        )
    }

    const answeredCount = Object.keys(answers).length
    const mandatoryCount = poll.questions.filter(q => q.mandatory).length
    const mandatoryAnswered = poll.questions.filter(q => q.mandatory && answers[q.id]).length

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="relative max-w-xl mx-auto px-5 py-12 pb-32">
                {/* logo */}
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#0a0a0a]" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Pollx</span>
                </div>

                {/* header */}
                <div className="mb-8">
                    <h1 className="text-white text-2xl font-semibold tracking-tight">{poll.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-[#444] text-sm">
                            {poll.questions.length} question{poll.questions.length !== 1 ? "s" : ""}
                        </p>
                        {poll.anonymousVote && (
                            <span className="text-[#333] text-xs flex items-center gap-1">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                                Anonymous
                            </span>
                        )}
                    </div>
                </div>

                {/* questions */}
                <div className="space-y-4">
                    {poll.questions.map((q, i) => (
                        <div key={q.id} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 space-y-4">
                            <div className="flex items-start gap-2">
                                <span className="text-[#444] text-xs shrink-0 mt-0.5">Q{i + 1}</span>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium leading-snug">
                                        {q.question}
                                        {q.mandatory && <span className="text-[#ef4444] ml-1">*</span>}
                                    </p>
                                    {!q.mandatory && (
                                        <p className="text-[#333] text-xs mt-0.5">Optional</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {q.options.map(option => {
                                    const selected = answers[q.id] === option.id
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => selectOption(q.id, option.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                                            style={{
                                                background: selected ? "#ffffff08" : "#0a0a0a",
                                                borderColor: selected ? "#ffffff22" : "#1f1f1f",
                                            }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                                style={{
                                                    borderColor: selected ? "#fff" : "#2a2a2a",
                                                }}
                                            >
                                                {selected && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className="text-sm" style={{ color: selected ? "#fff" : "#888" }}>
                                                {option.option}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* sticky footer */}
            <div className="fixed bottom-0 inset-x-0 border-t border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur px-5 py-4 flex items-center justify-between">
                <p className="text-[#333] text-xs">
                    {answeredCount} of {poll.questions.length} answered
                    {mandatoryCount > 0 && (
                        <span className="ml-1 text-[#444]">· {mandatoryAnswered}/{mandatoryCount} required</span>
                    )}
                </p>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#e5e5e5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    )
}

// ── Root component — decides which view to render ─────────────────────────────
export default function PublicPoll() {
    const { pollId } = useParams();

    if (!pollId) return;

    const [poll, setPoll] = useState<Poll | null>(null)
    useEffect(() => {
        pollService.publishPoll(pollId)
            .then(r => setPoll(r.data.data))
    }, [pollId])
    // const poll = MOCK_POLL

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