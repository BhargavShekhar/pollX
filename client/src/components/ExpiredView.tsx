import { formatDate } from "@/utils/formatDate";
import type { Poll } from "@/types/types";

export function ExpiredView({ poll }: { poll: Poll }) {
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