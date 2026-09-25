// Product limits agreed in Milestone 2. Change numbers here, never inside features.
const MB = 1024 * 1024;

export const limits = {
  audio: { maxBytes: 100 * MB, maxMinutes: 90, extensions: ["mp3", "wav", "m4a"] },
  document: { maxBytes: 10 * MB, extensions: ["txt", "pdf", "docx"] },
  pastedTextMaxChars: 500_000,
  uploadsPerHour: 10,
  meetingsPerDay: 5,
} as const;
