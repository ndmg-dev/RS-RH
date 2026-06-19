import { Post } from "../types";

export const mockPosts: Post[] = [
  {
    id: "post-1",
    content: "Atenção equipe! O prazo final para entrega do SPED Fiscal referente ao mês anterior é no dia 20. Por favor, revisem os lotes de notas fiscais de entrada e saída pendentes no sistema até amanhã para evitarmos correria e possíveis inconsistências. Se precisarem de apoio com alguma conciliação de ICMS, o time fiscal está à disposição!",
    author: {
      id: "user-4",
      fullName: "Fernanda Lima",
      jobTitle: "Analista Fiscal Pleno",
      department: "Fiscal",
      avatarUrl: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=b45309&color=fff&size=128"
    },
    likeCount: 6,
    commentCount: 2,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-18T09:15:00Z",
    updatedAt: "2026-06-18T09:15:00Z"
  },
  {
    id: "post-2",
    content: "Dica de produtividade contábil 📊: Ao iniciar o fechamento dos balancetes mensais, comecem sempre pela conferência dos saldos de caixa e bancos em relação aos extratos físicos. Identificar divergências de conciliação bancária logo no início economiza horas de investigação no final do processo. Fica a dica!",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      department: "Contábil",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    likeCount: 12,
    commentCount: 3,
    likedByMe: true,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-17T14:30:00Z",
    updatedAt: "2026-06-17T14:30:00Z"
  },
  {
    id: "post-3",
    content: "Olá pessoal! Passando para lembrar que no próximo dia 25 teremos nosso treinamento interno mensal. O tema deste mês será 'Comunicação Intersetorial Eficiente e Alinhamento de Processos'. O link para a videochamada já está nos convites do calendário de todos. Contamos com a participação ativa de cada setor!",
    author: {
      id: "user-2",
      fullName: "Mariana Silva",
      jobTitle: "Coordenadora de Recursos Humanos",
      department: "Recursos Humanos",
      avatarUrl: "https://ui-avatars.com/api/?name=Mariana+Silva&background=0f766e&color=fff&size=128"
    },
    likeCount: 8,
    commentCount: 1,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-17T10:00:00Z",
    updatedAt: "2026-06-17T10:00:00Z"
  },
  {
    id: "post-4",
    content: "⚠️ ALERTA DE SEGURANÇA (TI): Identificamos uma campanha ativa de phishing por e-mail se passando por atualizações do eSocial. Lembrem-se: a equipe de TI ou o próprio eSocial nunca solicita redefinição de senhas nem download de anexos executáveis (.exe, .zip) por links externos não oficiais. Em caso de dúvida, não cliquem e entrem em contato conosco imediatamente.",
    author: {
      id: "user-1",
      fullName: "Eduardo Melo",
      jobTitle: "Desenvolvedor",
      department: "Tecnologia",
      avatarUrl: "https://ui-avatars.com/api/?name=Eduardo+Melo&background=0a66c2&color=fff&size=128"
    },
    likeCount: 15,
    commentCount: 4,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-16T16:45:00Z",
    updatedAt: "2026-06-16T16:45:00Z"
  },
  {
    id: "post-5",
    content: "Lembrete amigável do Departamento Pessoal 📝: A programação de férias para o segundo semestre deve ser enviada via formulário interno até o fim deste mês. Isso ajuda a coordenar os fluxos de trabalho e a garantir que os pagamentos e cálculos de provisões sejam processados sem atrasos. Qualquer dúvida sobre saldo ou período aquisitivo, me mandem uma mensagem!",
    author: {
      id: "user-5",
      fullName: "Lucas Oliveira",
      jobTitle: "Assistente de Departamento Pessoal",
      department: "Departamento Pessoal",
      avatarUrl: "https://ui-avatars.com/api/?name=Lucas+Oliveira&background=6b21a8&color=fff&size=128"
    },
    likeCount: 5,
    commentCount: 1,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-16T09:30:00Z",
    updatedAt: "2026-06-16T09:30:00Z"
  },
  {
    id: "post-6",
    content: "Gostaria de compartilhar um feedback excelente que recebemos de um de nossos maiores clientes industriais hoje. Eles elogiaram a rapidez na entrega do relatório consolidado do primeiro trimestre e a paciência da equipe Contábil em sanar dúvidas. Parabéns a todos pelo empenho diário, essa sinergia entre atendimento e operação é o que nos destaca!",
    author: {
      id: "user-6",
      fullName: "Beatriz Costa",
      jobTitle: "Gerente de Atendimento ao Cliente",
      department: "Atendimento",
      avatarUrl: "https://ui-avatars.com/api/?name=Beatriz+Costa&background=0369a1&color=fff&size=128"
    },
    likeCount: 18,
    commentCount: 5,
    likedByMe: true,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-15T15:30:00Z",
    updatedAt: "2026-06-15T15:30:00Z"
  },
  {
    id: "post-7",
    content: "Para quem acompanha as novidades fiscais: foi publicada hoje uma nova Instrução Normativa da Receita Federal que altera sutilmente as regras de retenção na fonte para prestadores de serviços de contabilidade. Estamos analisando os impactos práticos nos nossos clientes e, em breve, compartilharemos um resumo detalhado na pasta pública de documentos.",
    author: {
      id: "user-4",
      fullName: "Fernanda Lima",
      jobTitle: "Analista Fiscal Pleno",
      department: "Fiscal",
      avatarUrl: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=b45309&color=fff&size=128"
    },
    likeCount: 9,
    commentCount: 0,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-15T11:00:00Z",
    updatedAt: "2026-06-15T11:00:00Z"
  },
  {
    id: "post-8",
    content: "Estudando as novas diretrizes do IFRS para pequenas e médias empresas neste início de semana. O alinhamento das normas nacionais com as internacionais segue evoluindo e exige atualização contínua. Quem tiver interesse em debater as principais mudanças de nomenclatura de contas, me procure para tomarmos um café!",
    author: {
      id: "user-3",
      fullName: "Roberto Santos",
      jobTitle: "Analista Contábil Sênior",
      department: "Contábil",
      avatarUrl: "https://ui-avatars.com/api/?name=Roberto+Santos&background=1e3a8a&color=fff&size=128"
    },
    likeCount: 11,
    commentCount: 2,
    likedByMe: false,
    visibility: "COMPANY",
    status: "ACTIVE",
    createdAt: "2026-06-15T08:45:00Z",
    updatedAt: "2026-06-15T08:45:00Z"
  },
  {
    id: "post-9",
    content: "[ATENÇÃO - MODERAÇÃO MOCK] Este post contém palavras inadequadas e serve para testar as ferramentas de moderação administrativa. Deve ser ocultado ou revisado pelos moderadores da Rede MGCA, conforme as políticas de conduta da empresa para manter um ambiente saudável e profissional.",
    author: {
      id: "user-5",
      fullName: "Lucas Oliveira",
      jobTitle: "Assistente de Departamento Pessoal",
      department: "Departamento Pessoal",
      avatarUrl: "https://ui-avatars.com/api/?name=Lucas+Oliveira&background=6b21a8&color=fff&size=128"
    },
    likeCount: 1,
    commentCount: 1,
    likedByMe: false,
    visibility: "COMPANY",
    status: "HIDDEN",
    createdAt: "2026-06-14T17:00:00Z",
    updatedAt: "2026-06-14T17:00:00Z"
  }
];
