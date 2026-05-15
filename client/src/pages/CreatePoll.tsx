import pollService from "@/services/pollService";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

type Option = { id: string; value: string }
type Question = {
  id: string
  text: string
  mandatory: boolean
  options: Option[]
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function makeQuestion(): Question {
  return {
    id: uid(),
    text: "",
    mandatory: false,
    options: [
      { id: uid(), value: "" },
      { id: uid(), value: "" },
    ],
  }
}

export default function CreatePoll() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [expiresIn, setExpiresIn] = useState("")
  const [anonymousVote, setAnonymousVote] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([makeQuestion()])

  // ── question helpers ──────────────────────────────────────────
  const updateQuestion = (id: string, text: string) =>
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, text } : q))
    )

  const toggleMandatory = (id: string) =>
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, mandatory: !q.mandatory } : q))
    )

  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error("Maximum 20 questions allowed")
      return
    }
    setQuestions(prev => [...prev, makeQuestion()])
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error("At least one question is required")
      return
    }
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  // ── option helpers ────────────────────────────────────────────
  const updateOption = (qId: string, oId: string, value: string) =>
    setQuestions(prev =>
      prev.map(q =>
        q.id === qId
          ? { ...q, options: q.options.map(o => (o.id === oId ? { ...o, value } : o)) }
          : q
      )
    )

  const addOption = (qId: string) =>
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q
        if (q.options.length >= 10) {
          toast.error("Maximum 10 options per question")
          return q
        }
        return { ...q, options: [...q.options, { id: uid(), value: "" }] }
      })
    )

  const removeOption = (qId: string, oId: string) =>
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q
        if (q.options.length <= 2) {
          toast.error("At least 2 options required")
          return q
        }
        return { ...q, options: q.options.filter(o => o.id !== oId) }
      })
    )

  // ── submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Poll title is required"); return }
    if (!expiresIn) { toast.error("Expiry date is required"); return }
    if (new Date(expiresIn) <= new Date()) { toast.error("Expiry must be in the future"); return }

    for (const q of questions) {
      if (!q.text.trim()) { toast.error("All questions must have text"); return }
      const filled = q.options.filter(o => o.value.trim())
      if (filled.length < 2) { toast.error("Each question needs at least 2 options"); return }
    }

    const payload = {
      title: title.trim(),
      expiresIn: new Date(expiresIn),
      anonymousVote,
      publish: false,
      questions: questions.map(q => ({
        question: q.text.trim(),
        mandatory: q.mandatory,
        options: q.options.filter(o => o.value.trim()).map(o => o.value.trim()),
      })),
    }

    setLoading(true)
    try {
      await pollService.createPoll(payload);
      toast.success("Poll created successfully");
      navigate("/dashboard")
    } catch (err: any) {
      console.log(err?.response?.data);
      toast.error("Failed to create poll");
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* grid bg */}
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
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#555] hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </nav>

      <main className="relative max-w-2xl mx-auto px-6 py-10 pb-32">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold tracking-tight">Create a poll</h1>
          <p className="text-[#444] text-sm mt-1">Add questions and share the link to collect responses</p>
        </div>

        <div className="space-y-5">
          {/* poll meta card */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 space-y-4">
            <p className="text-[#888] text-xs font-medium uppercase tracking-widest">Poll settings</p>

            {/* title */}
            <div className="space-y-1.5">
              <label className="text-[#666] text-xs">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Team Lunch Preferences"
                maxLength={255}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#2a2a2a] outline-none focus:border-[#333] transition-colors"
              />
            </div>

            {/* expiry */}
            <div className="space-y-1.5">
              <label className="text-[#666] text-xs">Expires at</label>
              <input
                type="datetime-local"
                value={expiresIn}
                min={minDate}
                onChange={e => setExpiresIn(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#333] transition-colors [color-scheme:dark]"
              />
            </div>

            {/* anonymous toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-white text-sm">Anonymous responses</p>
                <p className="text-[#444] text-xs mt-0.5">Respondents won't need to sign in</p>
              </div>
              <button
                type="button"
                onClick={() => setAnonymousVote(v => !v)}
                className="relative w-10 h-5.5 rounded-full transition-colors duration-200 flex items-center"
                style={{
                  background: anonymousVote ? "#fff" : "#1f1f1f",
                  minWidth: "40px",
                  height: "22px",
                }}
              >
                <span
                  className="absolute w-4 h-4 rounded-full transition-all duration-200"
                  style={{
                    background: anonymousVote ? "#0a0a0a" : "#333",
                    left: anonymousVote ? "calc(100% - 18px)" : "2px",
                  }}
                />
              </button>
            </div>
          </div>

          {/* questions */}
          {questions.map((q, qi) => (
            <div
              key={q.id}
              className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5 space-y-4"
            >
              {/* question header */}
              <div className="flex items-center justify-between">
                <p className="text-[#888] text-xs font-medium uppercase tracking-widest">
                  Question {qi + 1}
                </p>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="text-[#333] hover:text-[#ef4444] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* question text */}
              <input
                value={q.text}
                onChange={e => updateQuestion(q.id, e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#2a2a2a] outline-none focus:border-[#333] transition-colors"
              />

              {/* options */}
              <div className="space-y-2">
                {q.options.map((o, oi) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-[#2a2a2a] shrink-0" />
                    <input
                      value={o.value}
                      onChange={e => updateOption(q.id, o.id, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-[#2a2a2a] outline-none focus:border-[#333] transition-colors"
                    />
                    <button
                      onClick={() => removeOption(q.id, o.id)}
                      className="text-[#2a2a2a] hover:text-[#ef4444] transition-colors shrink-0"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addOption(q.id)}
                  className="flex items-center gap-1.5 text-[#444] hover:text-white text-xs mt-1 px-1 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add option
                </button>
              </div>

              {/* mandatory toggle */}
              <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-3">
                <p className="text-[#555] text-xs">Mandatory</p>
                <button
                  type="button"
                  onClick={() => toggleMandatory(q.id)}
                  className="relative flex items-center rounded-full transition-colors duration-200"
                  style={{
                    background: q.mandatory ? "#fff" : "#1f1f1f",
                    minWidth: "32px",
                    height: "18px",
                    width: "32px",
                  }}
                >
                  <span
                    className="absolute w-3 h-3 rounded-full transition-all duration-200"
                    style={{
                      background: q.mandatory ? "#0a0a0a" : "#333",
                      left: q.mandatory ? "calc(100% - 14px)" : "2px",
                    }}
                  />
                </button>
              </div>
            </div>
          ))}

          {/* add question */}
          <button
            onClick={addQuestion}
            className="w-full border border-dashed border-[#1f1f1f] rounded-2xl py-4 text-[#444] hover:text-white hover:border-[#333] transition-all text-sm flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add question
          </button>
        </div>
      </main>

      {/* sticky footer */}
      <div className="fixed bottom-0 inset-x-0 border-t border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <p className="text-[#444] text-xs">
          {questions.length} question{questions.length !== 1 ? "s" : ""} · {questions.reduce((a, q) => a + q.options.filter(o => o.value.trim()).length, 0)} options
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#555] hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#e5e5e5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create poll"}
          </button>
        </div>
      </div>
    </div>
  )
}