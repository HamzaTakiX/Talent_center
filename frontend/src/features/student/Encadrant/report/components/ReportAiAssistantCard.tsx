import { Sparkles } from 'lucide-react';
import { reportAiAssistantText } from '../data/reportMock';

export default function ReportAiAssistantCard() {
  return (
    <section className="box-border flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-[14px] border border-solid border-[#e9d5ff] bg-[#faf5ff] p-4 font-inter">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-[#7c3aed]" aria-hidden />
        <h2 className="m-0 font-inter text-[15px] font-semibold leading-5 text-[#6d28d9]">
          Assistant IA
        </h2>
      </div>
      <p className="m-0 font-inter text-[13px] leading-5 text-[#7c3aed]">
        {reportAiAssistantText}
      </p>
    </section>
  );
}
