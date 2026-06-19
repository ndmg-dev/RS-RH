# Rede MGCA — Frontend da Rede Social Corporativa

Este é o frontend da **Rede MGCA** (Mendonça Galvão Contadores Associados), desenvolvido com **React**, **Vite** e **Tailwind CSS**. Esta rede social corporativa foi projetada para incentivar a colaboração, o alinhamento de processos e o compartilhamento de conhecimento interno de maneira saudável e profissional.

---

## 🚀 Tecnologias Utilizadas

A stack principal do projeto consiste em:

* **React 19** (Estrutura da aplicação)
* **Vite 8** (Build tool e HMR ultra-rápido)
* **TypeScript** (Tipagem estática estrita)
* **React Router (v6)** (Navegação SPA e proteção de rotas)
* **TanStack Query (v5)** (Gerenciamento de cache e requisições assíncronas)
* **Axios** (Cliente HTTP para integração de API)
* **React Hook Form** (Manipulação de formulários)
* **Zod** (Validação de schemas e formulários)
* **Tailwind CSS v4** (Estilização responsiva e moderna através de `@tailwindcss/vite`)
* **Lucide React** (Pacote de ícones SVG modernos)

---

## 🔒 Regras de Negócio Críticas (Sem Comparação Social)

Para incentivar a colaboração saudável e evitar competições sociais nocivas no ambiente de trabalho:
* **Sem Seguidores**: Não existem seguidores, seguindo ou contagem de conexões. Todos os colaboradores estão conectados na mesma rede organizacional por padrão.
* **Sem Rankings**: Não há rankings de popularidade, posts "mais populares", "top colaboradores" ou gamificação de engajamento baseada em pontos ou troféus.
* **Métricas Neutras**: O feed permite curtir e comentar para fins de engajamento profissional direto, mas estes números servem apenas para dar visibilidade interna e não são agregados em painéis competitivos.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `frontend` (usando o [.env.example](file:///c:/Users/user/Projetos/RSRH/frontend/.env.example) como base):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_MOCKS=true
VITE_APP_NAME="Rede MGCA"
```

* **`VITE_USE_MOCKS=true`**: Ativa o modo de desenvolvimento isolado com dados de teste persistidos temporariamente no `localStorage`.
* **`VITE_USE_MOCKS=false`**: Direciona as requisições HTTP para a API real configurada em `VITE_API_BASE_URL` (normalmente o gateway BFF na porta 3000).

---

## 🛠️ Como Instalar e Rodar

Certifique-se de ter o [Node.js v20+](https://nodejs.org/) instalado no sistema.

1. Navegue para a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

4. Execute o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em 👉 **http://localhost:5173**

---

## 🗂️ Estrutura de Pastas

A organização do código-fonte segue a estrutura modular proposta:

```txt
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx          # Ponto de inicialização dos providers globais
│   │   ├── router.tsx       # Definição e proteção de rotas (guards)
│   │   └── providers.tsx    # Agrupador do TanStack Query e AuthContext
│   ├── components/
│   │   ├── admin/           # Guardas de rotas e roles (ProtectedRoute, RoleGuard)
│   │   ├── comments/        # Formulários e itens de comentário (CommentList, CommentItem, CommentForm)
│   │   ├── common/          # Componentes reutilizáveis (LoadingState, ErrorState, EmptyState, ConfirmDialog)
│   │   ├── feed/            # Caixa de composição de post (PostComposer)
│   │   ├── layout/          # Estrutura principal do app (AppShell, Navbar, RightInfoPanel)
│   │   ├── posts/           # Cards de publicações e ações rápidas (PostCard, PostActions, LikeButton)
│   │   └── profile/         # Cards e blocos de perfil (SidebarProfileCard, ProfileHeader, ProfileAboutCard, ProfileSkillsCard)
│   ├── features/            # Camada de serviços HTTP por domínio
│   │   ├── auth/            # AuthContext, AuthProvider e auth.service.ts
│   │   ├── comments/        # comments.service.ts
│   │   ├── moderation/      # moderation.service.ts
│   │   ├── posts/           # posts.service.ts
│   │   └── users/           # users.service.ts
│   ├── lib/                 # Inicialização de bibliotecas externas (api.ts com Axios, auth-storage.ts, query-client.ts)
│   ├── mocks/               # Dados fictícios corporativos e banco em memória (db.ts, posts.mock.ts, comments.mock.ts, users.mock.ts)
│   ├── pages/               # Páginas da aplicação (LoginPage, FeedPage, ProfilePage, EditProfilePage, PostDetailPage, AdminModerationPage, NotFoundPage)
│   ├── styles/              # Arquivo CSS global (index.css) com importação do Tailwind CSS v4
│   ├── types/               # Tipos TypeScript centralizados (index.ts)
│   ├── utils/               # Utilitários globais (errors.ts, permissions.ts)
│   └── main.tsx             # Arquivo de entrada do React
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📍 Rotas e Níveis de Permissão

A navegação foi estruturada sob os seguintes caminhos:

* **`/login`** (Pública): Tela de acesso institucional com formulário seguro.
* **`/feed`** (Protegida - Qualquer papel): Visualização do feed corporativo em 3 colunas, publicação de conteúdos e interação rápida.
* **`/profile/me`** (Protegida - Qualquer papel): Visualização do próprio perfil profissional do colaborador.
* **`/profile/:userId`** (Protegida - Qualquer papel): Visualização do perfil de outro colega da Mendonça Galvão.
* **`/profile/me/edit`** (Protegida - Qualquer papel): Formulário completo de edição do próprio perfil (Nome, cargo, bio, competências, avatar).
* **`/posts/:postId`** (Protegida - Qualquer papel): Detalhes de uma publicação e lista expandida de comentários.
* **`/admin/moderation`** (Protegida - Apenas `ADMIN` e `MODERATOR`): Fila de publicações e comentários sinalizados para ocultação ou restauração de visibilidade.

### Níveis de Permissões:
1. **`USER`**: Pode criar posts, curtir, comentar e gerenciar (editar/excluir) suas próprias publicações e comentários.
2. **`MODERATOR`**: Possui o escopo de `USER`, além de acesso ao Painel de Moderação, podendo excluir ou ocultar publicações e comentários de terceiros. Não pode editar o perfil ou posts de outros colaboradores.
3. **`ADMIN`**: Possui liberdade total no sistema (controle absoluto de moderação, exclusões e edições).

---

## 🎨 Decisões de UX/UI

* **Estética LinkedIn Premium**: Layout clássico em 3 colunas (sidebar esquerda, feed central, avisos institucionais à direita) com cards brancos de cantos arredondados (`rounded-xl`), fundo cinza claro (`#f3f2ef`), e sombras sutis (`shadow-sm`).
* **Responsividade Completa**: Adaptável para dispositivos móveis (1 coluna empilhando os cards de perfil e avisos) e tablets (2 colunas).
* **Persistência em Mock**: Modificações feitas em modo de teste (como criar posts, curtir, comentar e editar perfil) são salvas no `localStorage`, evitando resets frustrantes a cada recarregamento de página.
* **Confirmações de Segurança**: Diálogos modais em português para operações irreversíveis (exclusão de publicações, ocultação administrativa).

---

## 🔌 Integração Futura com o Backend

Quando o backend e o BFF/Gateway estiverem prontos, a transição é direta:
1. Mude a variável `VITE_USE_MOCKS` para `false` no arquivo `.env`.
2. Configure `VITE_API_BASE_URL` para o endereço real do gateway (ex: `http://localhost:3000/api/v1`).
3. Toda a comunicação HTTP já está centralizada nos arquivos de serviço (`features/*/` utilizando o cliente Axios `lib/api.ts`). O sistema passará a se comunicar nativamente através de chamadas de rede reais, enviando o JWT nos cabeçalhos e decodificando as respostas no mesmo formato tipado.
