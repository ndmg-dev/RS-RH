import { Comment } from "../types";

export const mockComments: Comment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    content: "Excelente lembrete, Fernanda! Vou alinhar com o time contábil para garantir que todas as provisões fiscais coincidam.",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-18T09:30:00Z",
    updatedAt: "2026-06-18T09:30:00Z"
  },
  {
    id: "comment-2",
    postId: "post-1",
    content: "Obrigada pelo aviso! Nós do DP vamos adiantar os envios das informações trabalhistas necessárias para o fechamento fiscal hoje mesmo.",
    author: {
      id: "user-5",
      fullName: "Lucas Oliveira",
      jobTitle: "Assistente de Departamento Pessoal",
      avatarUrl: "https://ui-avatars.com/api/?name=Lucas+Oliveira&background=6b21a8&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-18T09:45:00Z",
    updatedAt: "2026-06-18T09:45:00Z"
  },
  {
    id: "comment-3",
    postId: "post-2",
    content: "Dica de ouro, Roberto! Já perdi muito tempo no passado procurando furos de centavos que eram apenas tarifas bancárias não lançadas no início.",
    author: {
      id: "user-4",
      fullName: "Fernanda Lima",
      jobTitle: "Analista Fiscal Pleno",
      avatarUrl: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=b45309&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-17T14:50:00Z",
    updatedAt: "2026-06-17T14:50:00Z"
  },
  {
    id: "comment-4",
    postId: "post-2",
    content: "Concordo totalmente. A disciplina com a conciliação bancária diária ou semanal facilita absurdamente o trabalho final.",
    author: {
      id: "user-1",
      fullName: "Eduardo Melo",
      jobTitle: "Desenvolvedor",
      avatarUrl: "https://ui-avatars.com/api/?name=Eduardo+Melo&background=0a66c2&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-17T15:10:00Z",
    updatedAt: "2026-06-17T15:10:00Z"
  },
  {
    id: "comment-5",
    postId: "post-2",
    content: "Muito bom. Vou compartilhar esse macete com o novo estagiário que começou conosco esta semana.",
    author: {
      id: "user-6",
      fullName: "Beatriz Costa",
      jobTitle: "Gerente de Atendimento ao Cliente",
      avatarUrl: "https://ui-avatars.com/api/?name=Beatriz+Costa&background=0369a1&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-17T15:30:00Z",
    updatedAt: "2026-06-17T15:30:00Z"
  },
  {
    id: "comment-6",
    postId: "post-3",
    content: "Perfeito, Mariana! Estarei presente. Esse tema é muito relevante para afinarmos a comunicação entre o fiscal e o atendimento.",
    author: {
      id: "user-4",
      fullName: "Fernanda Lima",
      jobTitle: "Analista Fiscal Pleno",
      avatarUrl: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=b45309&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-17T10:15:00Z",
    updatedAt: "2026-06-17T10:15:00Z"
  },
  {
    id: "comment-7",
    postId: "post-4",
    content: "Valeu pelo alerta, Edu! Já ia perguntar se aquele e-mail estranho que recebi era real. Excluí imediatamente.",
    author: {
      id: "user-5",
      fullName: "Lucas Oliveira",
      jobTitle: "Assistente de Departamento Pessoal",
      avatarUrl: "https://ui-avatars.com/api/?name=Lucas+Oliveira&background=6b21a8&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-16T17:00:00Z",
    updatedAt: "2026-06-16T17:00:00Z"
  },
  {
    id: "comment-8",
    postId: "post-4",
    content: "Obrigada, equipe de TI. Importante reforçar esses avisos com frequência, os golpistas estão cada vez mais sofisticados.",
    author: {
      id: "user-2",
      fullName: "Mariana Silva",
      jobTitle: "Coordenadora de Recursos Humanos",
      avatarUrl: "https://ui-avatars.com/api/?name=Mariana+Silva&background=0f766e&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-16T17:15:00Z",
    updatedAt: "2026-06-16T17:15:00Z"
  },
  {
    id: "comment-9",
    postId: "post-5",
    content: "Formulário enviado! Férias programadas para outubro. Valeu pelo lembrete!",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-16T09:50:00Z",
    updatedAt: "2026-06-16T09:50:00Z"
  },
  {
    id: "comment-10",
    postId: "post-6",
    content: "Ficamos muito felizes em ler isso. Toda a equipe contábil trabalhou com dedicação para deixar esses fechamentos impecáveis.",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-15T15:45:00Z",
    updatedAt: "2026-06-15T15:45:00Z"
  },
  {
    id: "comment-11",
    postId: "post-6",
    content: "Parabéns, pessoal! Esse tipo de retorno motiva muito e consolida a nossa qualidade de entrega corporativa.",
    author: {
      id: "user-2",
      fullName: "Mariana Silva",
      jobTitle: "Coordenadora de Recursos Humanos",
      avatarUrl: "https://ui-avatars.com/api/?name=Mariana+Silva&background=0f766e&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-15T16:00:00Z",
    updatedAt: "2026-06-15T16:00:00Z"
  },
  {
    id: "comment-12",
    postId: "post-8",
    content: "Com certeza aceito o café, Roberto! Quero entender os impactos no grupo de contas do ativo intangível.",
    author: {
      id: "user-4",
      fullName: "Fernanda Lima",
      jobTitle: "Analista Fiscal Pleno",
      avatarUrl: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=b45309&color=fff&size=128"
    },
    status: "ACTIVE",
    createdAt: "2026-06-15T09:10:00Z",
    updatedAt: "2026-06-15T09:10:00Z"
  },
  {
    id: "comment-13",
    postId: "post-9",
    content: "[COMENTÁRIO MODERAÇÃO MOCK] Este comentário é sinalizado e inadequado. Deve ser moderado na página de administração.",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    status: "HIDDEN",
    createdAt: "2026-06-14T17:10:00Z",
    updatedAt: "2026-06-14T17:10:00Z"
  }
];
