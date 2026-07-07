import { HomeHero } from "@/components/dashboard/home-hero";
import { HomeCta } from "@/components/dashboard/home-cta";
import { ProvaDistribuicaoBar } from "@/components/dashboard/prova-distribuicao-bar";
import { PROVA_DATA } from "@/types";

function diasParaProva() {
  const hoje = new Date();
  const diff = PROVA_DATA.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomePage() {
  const dias = diasParaProva();

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-8">
        <HomeHero diasParaProva={dias} />
        <HomeCta />
        <ProvaDistribuicaoBar />
      </main>
    </div>
  );
}
