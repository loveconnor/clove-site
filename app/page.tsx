import { FillSlot } from "./_components/fill/FillSlot";
import { FooterStrip } from "./_components/FooterStrip";
import { HeroPitch } from "./_components/HeroPitch";
import { TopBar } from "./_components/TopBar";
import { WorkList } from "./_components/WorkList";

export default function Home() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="flex min-h-svh flex-col md:h-svh md:overflow-hidden">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">
          <FillSlot />
          <section
            aria-label="Hero"
            className="mx-auto w-full max-w-[1600px] px-6 pb-10 pt-2 md:px-12 md:pb-14 md:pt-4"
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-end md:gap-14 lg:gap-24">
              <HeroPitch />
              <WorkList />
            </div>
          </section>
        </main>
        <FooterStrip />
      </div>
    </>
  );
}
