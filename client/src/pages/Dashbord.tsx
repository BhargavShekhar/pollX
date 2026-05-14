import authService from "@/services/authService"
import { PollCard } from "@/components/PollCard"
import { useState } from "react"
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

// mock data — replace with real API call
const MOCK_POLLS: Poll[] = [
  { id: "abc123", title: "Team Lunch Preferences", anonymousVote: true, publish: false, expiresIn: new Date(Date.now() + 86400000 * 2).toISOString(), createdAt: new Date().toISOString(), _count: { votes: 12 } },
  { id: "def456", title: "Q2 Retrospective Feedback", anonymousVote: false, publish: false, expiresIn: new Date(Date.now() + 86400000 * 5).toISOString(), createdAt: new Date().toISOString(), _count: { votes: 34 } },
  { id: "ghi789", title: "Office Hours Poll", anonymousVote: true, publish: true, expiresIn: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), _count: { votes: 89 } },
  { id: "jkl012", title: "Tech Stack Survey 2025", anonymousVote: false, publish: true, expiresIn: new Date(Date.now() - 86400000 * 3).toISOString(), createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), _count: { votes: 156 } },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<"active" | "ended">("active")
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS)

  const activePoll = polls.filter(p => new Date(p.expiresIn) > new Date() && !p.publish)
  const endedPolls = polls.filter(p => new Date(p.expiresIn) <= new Date() || p.publish)

  const displayed = tab === "active" ? activePoll : endedPolls

  const handleDelete = (id: string) => {
    setPolls(prev => prev.filter(p => p.id !== id))
  }

  const handleLogout = async () => {
    try {
      await authService.signout();

      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* subtle grid bg */}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/polls/create")}
            className="flex items-center gap-1.5 bg-white text-[#0a0a0a] text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-[#e5e5e5] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New poll
          </button>
          <button
            onClick={handleLogout}
            className="text-[#555] hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="relative max-w-4xl mx-auto px-6 py-10">
        {/* header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold tracking-tight">Your polls</h1>
            <p className="text-[#444] text-sm mt-1">{polls.length} poll{polls.length !== 1 ? "s" : ""} total</p>
          </div>

          {/* tabs */}
          <div className="flex items-center bg-[#111] border border-[#1f1f1f] rounded-xl p-1 gap-1">
            {(["active", "ended"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#0a0a0a" : "#555",
                }}
              >
                {t}
                <span
                  className="ml-1.5 text-[10px]"
                  style={{ color: tab === t ? "#888" : "#333" }}
                >
                  {t === "active" ? activePoll.length : endedPolls.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* poll grid */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1f1f1f] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <p className="text-[#333] text-sm">No {tab} polls</p>
            {tab === "active" && (
              <button
                onClick={() => navigate("/polls/create")}
                className="mt-4 text-white text-xs underline underline-offset-4 hover:text-[#ccc] transition-colors"
              >
                Create your first poll
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayed.map(poll => (
              <PollCard key={poll.id} poll={poll} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}