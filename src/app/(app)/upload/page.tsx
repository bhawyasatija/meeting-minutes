import type { Metadata } from "next";
import { UploadPanel } from "@/features/upload";

export const metadata: Metadata = { title: "Upload" };

export default function UploadPage() {
  return <UploadPanel />;
}
