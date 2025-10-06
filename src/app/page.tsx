"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const examplePrompt =
    "Please let me get all of the data from my PDF, Google Sheet, and Doc files for NovaAI, find the long-term profitability trends, create a graph, and draft an email with summarized business info and the graph, so I can send it to my boss.";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/blackbox");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* grain texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(transparent_1px,rgba(0,0,0,0.15)_1px)] [background-size:3px_3px]" />
      {/* neon orb */}
      <div className="pointer-events-none absolute -z-10 left-1/2 top-8 h-[340px] w-[340px] -translate-x-1/2 rounded-full blur-3xl [background:conic-gradient(from_180deg_at_50%_50%,oklch(0.78_0.24_340)_0%,oklch(0.78_0.24_20)_30%,oklch(0.75_0.22_90)_60%,oklch(0.8_0.22_10)_90%,oklch(0.78_0.24_340)_100%)]" />

      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,.4)]">
            Welcome, how can I help?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Describe what you want to build. We’ll compose MCP tools for you.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 md:p-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_0_0_1px_rgba(255,255,255,.04)]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Your wish is my command"
                  className="w-full resize-none bg-transparent outline-none text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/70 p-2 md:p-3 text-foreground"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full px-4 py-2 text-sm font-medium bg-white text-black hover:opacity-90 transition shadow-[0_0_0_1px_rgba(255,255,255,.2)_inset]"
              >
                Submit
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  +
                </span>
                <span className="inline-flex h-7 items-center rounded-full border border-white/10 px-3 bg-white/5">
                  Options
                </span>
              </div>
              <div className="opacity-80">Voice</div>
            </div>
          </div>
          <div className="mt-4 text-xs md:text-lg text-muted-foreground">
            Need inspiration?{" "}
            <div>
              <button
                type="button"
                onClick={() => {
                  setPrompt(examplePrompt);
                  textareaRef.current?.focus();
                }}
                className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1 text-foreground transition hover:bg-white/20"
              >
                {examplePrompt}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
