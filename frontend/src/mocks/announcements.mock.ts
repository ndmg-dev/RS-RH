import { Announcement } from "../types";

export const mockAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Plantão de Dúvidas Fiscal",
    content: "Toda terça-feira às 14h, com foco no preenchimento de obrigações tributárias municipais.",
    type: "EVENT",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: "announcement-2",
    title: "Portal de Documentos",
    content: "Novos modelos de relatórios de balanços patrimoniais adicionados na pasta pública.",
    type: "DOCUMENT",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  }
];
