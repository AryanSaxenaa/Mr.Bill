"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatAgentNote } from "@/lib/format-agent-note";
import { Loader2, PlayCircle, Sparkles } from "lucide-react";

interface AskMrBillPanelProps {
  draft: string;
  onDraftChange: (v: string) => void;
  onParse: () => void;
  onRunDemoScript: () => void;
  loading: boolean;
  lastAssistantNote?: string | null;
  agentMode: "demo" | "live" | null;
  llmNotice: string | null;
  apiError: string | null;
}

export function AskMrBillPanel({
  draft,
  onDraftChange,
  onParse,
  onRunDemoScript,
  loading,
  lastAssistantNote,
  agentMode,
  llmNotice,
  apiError,
}: AskMrBillPanelProps) {
  const formattedNote = lastAssistantNote
    ? formatAgentNote(lastAssistantNote)
    : null;

  return (
    <aside
      className="flex flex-col rounded-xl border border-stripe-border bg-linen card-shadow lg:max-w-sm"
      data-tour="ask-mrbill"
    >
      <div className="border-b border-stripe-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-sage" strokeWidth={1.75} />
          <h2 className="font-display text-base font-semibold text-espresso">
            Ask Mr.Bill
          </h2>
        </div>
        <p className="mt-1 text-xs text-cocoa">
          Natural language fill - parses into the line table. Use action buttons
          on the form to RFQ and compare.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {agentMode === "demo" && (
          <p className="rounded-md border border-sage/30 bg-sage/10 px-2 py-1.5 text-xs text-espresso">
            Demo mode - full order desk flow; connect an AI key for live assistant.
          </p>
        )}

        {llmNotice && (
          <p
            className={cn(
              "rounded-md border px-2 py-1.5 text-xs",
              llmNotice.startsWith("deepseek-retry:")
                ? "border-sage/30 bg-sage/10"
                : "border-terracotta/30 bg-terracotta/10",
            )}
            role="status"
          >
            {llmNotice.startsWith("deepseek-retry:")
              ? "Retried with backup model after the primary AI was unavailable."
              : llmNotice.startsWith("mail-fallback:")
                ? "Quote inbox send did not complete. Simulated Cairo Dairy and Bean & Barrel quotes are attached so you can compare."
                : "AI order desk unavailable - demo path used."}
          </p>
        )}

        {apiError && (
          <p
            className="rounded-md border border-terracotta/40 bg-terracotta/10 px-2 py-1.5 text-xs text-espresso"
            role="alert"
          >
            {apiError}
          </p>
        )}

        <Textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          className="min-h-[120px] border-stripe-border bg-cream text-sm"
          placeholder="e.g. Maadi low on oat milk and cups before Friday; Zamalek needs 2kg espresso."
          disabled={loading}
        />

        <Button
          type="button"
          className="bg-primary text-primary-foreground"
          onClick={onRunDemoScript}
          disabled={loading}
          data-tour="run-demo"
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 size-4" />
          )}
          Run demo script
        </Button>

        <Button
          type="button"
          variant="outline"
          className="border-stripe-border bg-cream hover:bg-oat/40"
          onClick={onParse}
          disabled={loading || !draft.trim()}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          Parse into line items
        </Button>

        {formattedNote && (
          <div className="rounded-lg border border-stripe-border bg-cream p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-cocoa">
              Agent note
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-espresso">
              {formattedNote}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
