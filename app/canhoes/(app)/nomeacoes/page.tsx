"use client";

import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesNominationsModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesNominationsModule").then((m) => ({ default: m.CanhoesNominationsModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function NomeacoesPage() {
  return <CanhoesNominationsModule />;
}
