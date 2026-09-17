import type { Metadata } from "next";
import { PageHeader, Callout } from "@/components/ui";
import { AvisoPrivacidade } from "@/components/legal/aviso-privacidade";
export const metadata: Metadata = { title: "Privacidade" };
export default function PrivacidadePage() {
  return (
    <div className="max-w-[760px]">
      <PageHeader eyebrow="Aviso de privacidade" title="Dados tratados nesta plataforma" />
      <Callout tone="warn" title="Rascunho para revisão institucional">Este aviso é uma minuta preparada pelo professor e ainda não foi validada juridicamente. Não constitui declaração de conformidade certificada.</Callout>
      <AvisoPrivacidade />
    </div>
  );
}
