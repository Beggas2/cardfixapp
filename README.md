# CardFix - Sistema de Flashcards com IA

Um sistema completo de estudos com flashcards gerados por IA, repetição espaçada e gamificação.

## 🚀 Funcionalidades

### Backend
- **Autenticação JWT** com usuários anônimos e registrados
- **IA Gemini** para geração automática de flashcards
- **Repetição espaçada** com algoritmo SM-2
- **Sistema de billing** com Stripe
- **Painel administrativo** completo
- **Rate limiting** e proteção de endpoints
- **Logs estruturados** para auditoria
- **Fila de processamento** para IA

### Frontend
- **Interface moderna** com Tailwind CSS
- **Onboarding guiado** para novos usuários
- **Dashboard interativo** com estatísticas
- **Sistema de gamificação** com rankings
- **Relatórios de progresso** exportáveis
- **Responsivo** para mobile e desktop
- **Notificações** de revisão

## 🛠️ Tecnologias

### Backend
- **Encore.ts** - Framework TypeScript para APIs
- **PostgreSQL** - Banco de dados
- **Gemini AI** - Geração de conteúdo
- **JWT** - Autenticação
- **Stripe** - Pagamentos

### Frontend
- **React** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Lucide React** - Ícones

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta no Google AI Studio (Gemini)
- Conta no Stripe (opcional)

### Backend

1. Clone o repositório
```bash
git clone <repository-url>
cd cardfix
```

2. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as seguintes variáveis:
# - GeminiAPIKey: Sua chave da API do Gemini
# - JWTSecret: String secreta para JWT
# - StripeSecretKey: Chave secreta do Stripe (opcional)
```

3. Execute o projeto
```bash
# O Encore.ts irá automaticamente:
# - Instalar dependências
# - Configurar o banco de dados
# - Executar migrações
# - Iniciar o servidor

encore run
```

### Frontend

O frontend é automaticamente servido pelo Encore.ts e não requer configuração adicional.

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Gemini AI
GeminiAPIKey=your_gemini_api_key_here

# JWT
JWTSecret=your_super_secure_jwt_secret_here

# Stripe (opcional)
StripeSecretKey=sk_test_your_stripe_secret_key
StripePublishableKey=pk_test_your_stripe_publishable_key

# Email (opcional)
EmailAPIKey=your_email_service_api_key
```

### Obtendo as Chaves

1. **Gemini API Key**:
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma nova API key
   - Copie a chave para a variável `GeminiAPIKey`

2. **JWT Secret**:
   - Gere uma string aleatória segura
   - Exemplo: `openssl rand -base64 32`

3. **Stripe** (opcional):
   - Acesse [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copie as chaves de teste ou produção

## 📱 Uso

### Para Estudantes

1. **Cadastro/Login**
   - Crie uma conta ou use como convidado
   - Complete o onboarding guiado

2. **Criar Concurso**
   - Clique em "Novo Concurso"
   - Faça upload do edital (PDF ou texto)
   - Selecione seu cargo

3. **Gerar Plano de Estudos**
   - A IA analisará o edital
   - Criará estrutura de matérias e tópicos
   - Estimará quantidade de flashcards

4. **Estudar**
   - Gere flashcards com IA
   - Estude com repetição espaçada
   - Acompanhe seu progresso

### Para Administradores

1. **Painel Admin**
   - Acesse com conta de administrador
   - Visualize logs e estatísticas
   - Aprove/rejeite flashcards
   - Gerencie usuários

## 🏗️ Arquitetura

### Backend (Encore.ts)

```
backend/
├── auth/           # Autenticação JWT
├── users/          # Gestão de usuários
├── contests/       # CRUD de concursos
├── study/          # Planos de estudo e flashcards
├── ai/             # Integração com Gemini
├── billing/        # Stripe e planos
├── logs/           # Sistema de logs
└── external_dbs/   # Configuração do banco
```

### Frontend (React)

```
frontend/
├── components/     # Componentes React
├── hooks/          # Hooks customizados
├── types/          # Tipos TypeScript
└── utils/          # Utilitários
```

## 🔐 Autenticação

O sistema usa JWT com dois tipos de usuários:

- **Usuários Registrados**: Email/senha
- **Usuários Anônimos**: Acesso temporário

### Fluxo de Autenticação

1. Login/Registro → JWT Token
2. Token armazenado no localStorage
3. Requests autenticados via header Authorization
4. Middleware valida token em endpoints protegidos

## 🤖 IA e Processamento

### Gemini AI Integration

- **Extração de Cargos**: Analisa editais e identifica cargos
- **Geração de Planos**: Cria estrutura de matérias/tópicos
- **Criação de Flashcards**: Gera perguntas e respostas
- **Estimativas**: Calcula quantidade ideal de cards

### Rate Limiting

- Usuários FREE: 50 requests/dia
- Usuários PRO: 500 requests/dia
- Usuários PREMIUM: Ilimitado

## 📊 Gamificação

### Sistema de Pontos

- **Estudo Diário**: +10 pontos
- **Sequência de Dias**: Bônus multiplicador
- **Acertos Consecutivos**: +5 pontos extras
- **Conclusão de Tópicos**: +50 pontos

### Rankings

- **Mensal**: Top estudantes do mês
- **Por Matéria**: Especialistas em cada área
- **Sequências**: Maiores sequências de estudo

### Badges

- 🔥 **Sequência de Fogo**: 7 dias consecutivos
- 📚 **Estudioso**: 100 cards revisados
- 🎯 **Precisão**: 90% de acertos
- 👑 **Mestre**: Top 10 do ranking

## 📈 Relatórios

### Relatórios Disponíveis

- **Progresso Geral**: Visão completa do desempenho
- **Por Matéria**: Detalhamento por disciplina
- **Temporal**: Evolução ao longo do tempo
- **Comparativo**: Posição vs outros usuários

### Exportação

- **PDF**: Relatórios formatados
- **CSV**: Dados para análise
- **Imagem**: Gráficos para compartilhar

## 🔔 Notificações

### Tipos de Notificação

- **Cards Vencidos**: Lembrete de revisão
- **Metas Diárias**: Progresso do dia
- **Conquistas**: Novas badges/rankings
- **Sistema**: Atualizações importantes

### Canais

- **In-App**: Notificações na interface
- **Email**: Lembretes por email
- **Push**: Notificações do navegador

## 💳 Billing e Planos

### Planos Disponíveis

#### FREE
- 50 flashcards/mês
- 1 concurso ativo
- Funcionalidades básicas

#### PRO ($9.99/mês)
- 500 flashcards/mês
- 5 concursos ativos
- Relatórios avançados
- Suporte prioritário

#### PREMIUM ($19.99/mês)
- Flashcards ilimitados
- Concursos ilimitados
- IA premium
- Relatórios personalizados
- Suporte 24/7

### Integração Stripe

```typescript
// Exemplo de checkout
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_pro_monthly',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: `${domain}/success`,
  cancel_url: `${domain}/cancel`,
});
```

## 🚀 Deploy

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
encore run

# Acesse a aplicação
open http://localhost:4000
```

### Produção

O Encore.ts facilita o deploy para várias plataformas:

```bash
# Deploy para Encore Cloud
encore deploy

# Ou configure para outras plataformas
# AWS, GCP, Azure, etc.
```

### Variáveis de Produção

Configure as mesmas variáveis de ambiente no seu provedor de cloud:

- `GeminiAPIKey`
- `JWTSecret`
- `StripeSecretKey`
- `EmailAPIKey`

## 🧪 Testes

```bash
# Execute os testes
encore test

# Testes com coverage
encore test --coverage

# Testes específicos
encore test ./backend/users
```

## 📝 API Documentation

A documentação da API é gerada automaticamente pelo Encore.ts:

```bash
# Visualize a documentação
encore gen docs

# Ou acesse via web
open http://localhost:4000/docs
```

### Principais Endpoints

#### Autenticação
- `POST /users/login` - Login
- `POST /users/register` - Registro
- `POST /users/login-anonymous` - Login anônimo

#### Concursos
- `GET /contests` - Listar concursos
- `POST /contests` - Criar concurso
- `GET /contests/:id` - Obter concurso
- `DELETE /contests/:id` - Deletar concurso

#### Estudo
- `POST /study/plans` - Criar plano
- `GET /study/plans/:contestId` - Obter plano
- `POST /study/flashcards` - Gerar flashcards
- `GET /study/todays-cards/:contestId` - Cards do dia
- `POST /study/review` - Revisar card

#### IA
- `POST /ai/extract-roles` - Extrair cargos
- `POST /ai/generate-plan` - Gerar plano
- `POST /ai/generate-flashcards` - Gerar flashcards
- `POST /ai/estimate-cards` - Estimar quantidades

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs.cardfix.com](https://docs.cardfix.com)
- **Email**: suporte@cardfix.com
- **Discord**: [discord.gg/cardfix](https://discord.gg/cardfix)
- **Issues**: [GitHub Issues](https://github.com/cardfix/cardfix/issues)

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] **Mobile App** (React Native)
- [ ] **Integração com Calendários**
- [ ] **Estudo em Grupo**
- [ ] **Marketplace de Flashcards**
- [ ] **IA de Tutoria Personalizada**
- [ ] **Integração com Universidades**
- [ ] **Certificações Digitais**
- [ ] **Realidade Aumentada**

### Melhorias Técnicas

- [ ] **Cache Redis**
- [ ] **CDN para Assets**
- [ ] **Microserviços**
- [ ] **GraphQL**
- [ ] **WebSockets**
- [ ] **Kubernetes**
- [ ] **Monitoring Avançado**
- [ ] **A/B Testing**

---

**CardFix** - Transformando a forma como você estuda para concursos! 🚀
