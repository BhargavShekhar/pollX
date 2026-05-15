import type { Question } from "@/types/types"

export function QuestionCard({ question, index, totalVotes }: {
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