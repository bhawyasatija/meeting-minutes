// File: src/features/upload/components/upload-panel.tsx
// Purpose: the Milestone 7 upload screen. Two drop targets (recording, document); picking a file
// starts the upload immediately. On success we go to the dashboard, where the new meeting now shows
// up with status "Uploaded" (its report is built starting Milestone 8).
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileAudio, FileText, Loader2, UploadCloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { limits } from "@/config/limits";
import { useUploadThing } from "../lib/uploadthing-client";

type Endpoint = "meetingRecording" | "meetingDocument";

function mb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function UploadPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState<Endpoint | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onDone() {
    setBusy(null);
    router.push("/dashboard");
    router.refresh();
  }

  function onFail(message: string) {
    setBusy(null);
    setError(message);
  }

  const recording = useUploadThing("meetingRecording", {
    onClientUploadComplete: onDone,
    onUploadError: (e) => onFail(e.message),
  });
  const document = useUploadThing("meetingDocument", {
    onClientUploadComplete: onDone,
    onUploadError: (e) => onFail(e.message),
  });

  function pick(endpoint: Endpoint, files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(endpoint);
    void (endpoint === "meetingRecording" ? recording : document).startUpload(Array.from(files));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload a meeting</h1>
        <p className="text-muted-foreground">
          Add a recording or a written transcript. We&apos;ll turn it into minutes.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="animate-fade-up flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <UploadTarget
          icon={FileAudio}
          label="Recording"
          hint={`MP3, WAV or M4A, up to ${mb(limits.audio.maxBytes)}MB / ${limits.audio.maxMinutes} min`}
          accept="audio/*"
          busy={busy === "meetingRecording"}
          disabled={busy !== null}
          onPick={(files) => pick("meetingRecording", files)}
        />
        <UploadTarget
          icon={FileText}
          label="Notes or transcript"
          hint={`TXT, PDF or DOCX, up to ${mb(limits.document.maxBytes)}MB`}
          accept=".txt,.pdf,.docx"
          busy={busy === "meetingDocument"}
          disabled={busy !== null}
          onPick={(files) => pick("meetingDocument", files)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Up to {limits.uploadsPerHour} uploads an hour, {limits.meetingsPerDay} meetings a day.
      </p>
    </div>
  );
}

function UploadTarget({
  icon: Icon,
  label,
  hint,
  accept,
  busy,
  disabled,
  onPick,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  accept: string;
  busy: boolean;
  disabled: boolean;
  onPick: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors",
        dragOver
          ? "border-primary bg-secondary"
          : "border-border hover:border-primary/50 hover:bg-secondary/40",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) onPick(e.dataTransfer.files);
      }}
    >
      {busy ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      ) : (
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud aria-hidden />
        {busy ? "Uploading…" : "Choose file"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onPick(e.target.files)}
      />
    </div>
  );
}
