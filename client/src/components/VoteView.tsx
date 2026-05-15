import pollService from "@/services/pollService"
import { useState } from "react"
import { toast } from "sonner"
import type { Poll } from "@/types/types"

export function VoteView({ poll }: { poll: Poll }) {
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
            await new Promise(r => setTimeout(r, 800)) // simulate
            setSubmitted(true)
        } catch (err: any) {
            console.log(err?.response);
            toast.error("Already Voted")
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