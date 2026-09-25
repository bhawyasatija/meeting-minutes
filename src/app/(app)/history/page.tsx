import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return <ComingSoon title="History" milestone={13} />;
}
