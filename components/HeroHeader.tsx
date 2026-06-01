import {
  HeroBadge,
  HeroButtons,
  HeroStatsPanel,
  HeroTitleBlock,
  type HeroHeaderContent,
} from '@/components/HeroHeaderContent';

type HeroHeaderProps = HeroHeaderContent;

export default function HeroHeader(props: HeroHeaderProps) {
  return (
    <header className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-end">
      <div className="space-y-7 text-center lg:text-left">
        <HeroBadge />
        <HeroTitleBlock />
        <HeroButtons />
      </div>

      <aside className="glass-panel rounded-3xl border border-white/10 p-5 shadow-[0_0_40px_rgba(2,8,23,0.45)] md:p-6">
        <HeroStatsPanel {...props} />
      </aside>
    </header>
  );
}
