import type { Poll } from "@/types/types"
import { formatDate } from "@/utils/formatDate"

export function ResultsView({ poll }: { poll: Poll }) {
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