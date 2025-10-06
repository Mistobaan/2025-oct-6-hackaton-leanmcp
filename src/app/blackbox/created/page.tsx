"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

function CreatedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  }

  if (!url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center text-foreground">
        <div>
          <h1 className="text-2xl font-semibold">Session URL not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Try creating a new MCP session to receive a shareable link.
          </p>
        </div>
        <Button onClick={() => router.push("/blackbox")}>Back to builder</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">MCP Created</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Share this MCP session URL or copy it for later use.
        </p>
      </div>
      <Button
        className="max-w-xl break-all bg-purple-600 text-white hover:bg-purple-600/90"
        onClick={handleCopy}
        aria-label={copied ? "URL copied" : "Copy MCP URL"}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className="text-left">{copied ? "Copied!" : url}</span>
      </Button>
      <Button variant="outline" onClick={() => router.push("/blackbox")}>Back to builder</Button>
    </div>
  );
}

export default function CreatedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <p className="text-sm text-muted-foreground">Loading session…</p>
        </div>
      }
    >
      <CreatedPageContent />
    </Suspense>
  );
}
