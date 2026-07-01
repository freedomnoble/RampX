import React from "react";
import { useApp } from "@/context/AppContext";
import { NeuCard } from "@/components/neu";
import BoardSeats from "@/components/BoardSeats";

export default function BoardPage() {
  const { workspace } = useApp();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up">Your Board</h1>
      <p className="text-[15px] text-slate2 mb-8">
        The people across departments at {workspace?.company_name} you'll rely on to make decisions and get things done.
      </p>
      <NeuCard className="p-7">
        <BoardSeats full />
      </NeuCard>
    </div>
  );
}
