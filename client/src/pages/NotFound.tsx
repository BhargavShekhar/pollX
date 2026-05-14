import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 overflow-hidden">
      {/* subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-white/5 blur-3xl rounded-full" />

      <div className="relative w-full max-w-md text-center">
        {/* logo */}
        <div className="inline-flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-[#0a0a0a]" />
          </div>

          <span className="text-white text-sm font-medium tracking-wide">
            Pollx
          </span>
        </div>

        {/* card */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-3xl p-8">
          <p className="text-[#444] text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Error 404
          </p>

          <h1 className="text-white text-5xl font-semibold tracking-tight mb-4">
            Page not found
          </h1>

          <p className="text-[#666] text-sm leading-6 max-w-sm mx-auto">
            The page you are looking for doesn&apos;t exist or may have been
            moved to another location.
          </p>

          {/* actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 bg-white text-[#0a0a0a] rounded-xl py-3 px-4 text-sm font-semibold hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <Link
              to="/login"
              className="flex-1 border border-[#1f1f1f] text-white rounded-xl py-3 px-4 text-sm font-medium hover:bg-[#161616] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-[#333] text-xs mt-6 tracking-wide">
          POLLX • SIMPLE POLLING PLATFORM
        </p>
      </div>
    </div>
  );
}