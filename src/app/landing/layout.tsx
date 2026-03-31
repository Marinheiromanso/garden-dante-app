import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Magic Garden — O App Completo para Jardineiros Profissionais",
  description: "Gerencie clientes, agende podas, gere orçamentos, escaneie plantas com IA e muito mais. O app que transforma seu serviço de jardinagem.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
