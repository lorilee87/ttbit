# TTBIT — Desenho da versão 1

Data: 03/11/2026 · Dona do projeto: Lori · Status: rascunho para aprovação

Telas de exemplo: `proposta.html` · Comparação de caminhos: `comparacao.html` (nesta pasta). As telas de exemplo são anteriores a este documento. Onde houver diferença (por exemplo, fotos), vale este documento.

Legenda: **[Lori]** = decidido pela Lori. **[minha escolha]** = decisão do Claude, que a Lori pode mudar.

---

## 1. O que é e por quê

O TTBIT é um diário de fé para praticar a gratidão e a oração todos os dias. A Lori quer usar o app e passar o link para amigos usarem também. Cada pessoa tem o seu diário, guardado só no próprio celular. **[Lori]**

O problema que ele resolve: o que a pessoa anota some da vista e é esquecido. Por isso o app traz de volta o que importa: destaques, "neste dia", orações respondidas e resumo do mês. **[Lori]**

## 2. Para quem
- A Lori e os amigos dela, usando principalmente o **celular**. **[Lori]**
- Ninguém precisa saber nada de tecnologia para usar.
- Todo mundo começa do zero. Não há anotações antigas para importar. **[Lori]**

## 3. Metas, o que não é e o que seria um fracasso

**Metas da versão 1**
- Escrever o agradecimento (TTB) e o devocional do dia em poucos toques.
- Organizar pedidos de oração em listas e marcar os que foram respondidos.
- Achar qualquer anotação antiga por palavra.
- Ver, sem precisar procurar, o que vale lembrar.
- Não perder o diário ao trocar de celular, graças à cópia de segurança.

**Não é (fica fora da versão 1)**
- Rede social: ninguém vê o diário de outra pessoa. **[Lori]**
- Login, contas ou nuvem. **[Lori]**
- Fotos. **[Lori]**
- Contador de dias seguidos. **[Lori]**
- Notificação enviada pelo próprio app (precisaria de servidor). O lembrete diário é feito pelo calendário do celular (seção 6.10). **[Lori]**
- Importar anotações antigas. **[Lori]**
- App de loja (App Store ou Google Play).
- Bíblia dentro do app. **[Lori]**

**Seria um fracasso se**
- Gerasse qualquer custo. **[Lori]**
- Ficasse complicado ou "cheio". O app tem que ser simples, direto e elegante. **[Lori]**
- Alguém perdesse o diário sem ter sido avisado de que precisava fazer cópia.
- Algum texto de alguém saísse do celular sem a pessoa mandar.

## 4. Restrições
- **Custo zero.** **[Lori]**
- **Só texto**, sem fotos. **[Lori]**
- **Idiomas:** português e inglês. **[Lori]**
- **Tudo fica guardado só no aparelho**, sem servidor e sem banco de dados na nuvem. **[Lori]**
- **Onde mora:** o código fica numa pasta local em Documentos, ligada a um repositório no GitHub, nunca no Google Drive. Os documentos de texto ficam nesta pasta do Drive. **[regra da Lori]**
- Nada é instalado sem avisar antes o que é e para quê. **[regra da Lori]**

## 5. Caminhos considerados

| Caminho | Bom | Ruim |
|---|---|---|
| A. Firebase (Google) | Login Google, nada se perde, funciona em vários aparelhos | Precisa de conta no Firebase; a dona do projeto consegue ver os dados de todos pelo painel |
| B. Supabase | Busca pronta | No plano grátis pausa após 1 semana sem uso |
| **C. Tudo só no celular** ✅ | O mais simples, grátis, sem conta, ninguém vê os dados de ninguém | Sem login; se perder o celular sem cópia, perde o diário; cada aparelho tem o seu diário |

**Escolhido: C** **[Lori]**. A Lori primeiro escolheu o A e depois mudou para o C, sabendo das desvantagens. O risco de perder dados fica coberto pela **cópia de segurança** (seção 6.9). **[Lori]**

## 6. Como o app funciona

### 6.1 Abrir e instalar
- O app é um site que se comporta como app (PWA). Ele fica num endereço gratuito e pode ser "instalado" na tela inicial do celular.
- **Não há login.** A pessoa abre o link e começa a usar. **[Lori]**
- Depois do primeiro acesso, o app funciona **sem internet**.
- No primeiro acesso, o idioma segue o do celular e pode ser trocado em Ajustes. **[minha escolha]**
- **No iPhone:** se o app não estiver instalado na tela inicial, o Safari pode apagar os dados de um site que fica um tempo sem uso. Por isso, no iPhone, o app mostra um aviso curto ensinando a "Adicionar à Tela de Início" enquanto ele não estiver instalado. Esse aviso pode ser fechado. **[minha escolha]**
- O app pede ao navegador para guardar os dados de forma permanente, se o navegador permitir. **[minha escolha]**

### 6.2 Início
De cima para baixo:
1. **Versículo da pessoa:** texto e referência. Cabe um ou mais versículos. A pessoa troca quando quiser tocando em "trocar versículo" e **digita** o texto e a referência. Não existe Bíblia dentro do app. **[Lori]**
   - Versículo inicial, até a pessoa trocar: 1 Tessalonicenses 5:18, de traduções de domínio público (livres de direitos autorais). **[minha escolha]**
     - Em português (Almeida Revista e Corrigida): "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco."
     - Em inglês (King James): "In every thing give thanks: for this is the will of God in Christ Jesus concerning you."
2. **Hoje:** a data e dois botões, **+ TTB** e **+ Devocional**. Eles abrem o diário de hoje.
3. **★ Destaques:** as últimas anotações marcadas com estrela, de qualquer parte do app, com um "ver todos". **[Lori]**
4. **Neste dia:** o que a pessoa escreveu nesta mesma data há 1 mês, 6 meses e 1 ano. Só aparece o que existir; se não houver nada, a seção some. **[Lori; os períodos são minha escolha]**
5. **Atalho para o Resumo do mês.**
6. **Aviso de cópia:** um aviso discreto aparece se a última cópia de segurança tiver mais de 30 dias, ou se nunca tiver sido feita uma cópia e já existirem anotações de mais de 7 dias. Tocar no aviso leva para a cópia. **[minha escolha]**

Barra de baixo: **Início · Diário · Oração · Buscar**. Ajustes ficam num ícone no topo.

### 6.3 Diário (TTB e Devocional)
- Cada dia tem duas abas: **TTB** e **Devocional**. **[Lori]**
- Setas ou um calendário levam a outros dias, para ver e escrever em dias passados. **[minha escolha]**
- **TTB:** uma lista de agradecimentos curtos, numerados, sem limite de quantidade. Cada item pode ser editado, apagado (com confirmação) ou destacado ★.
- **Devocional:** um texto livre por dia. Pode ser editado, apagado (com confirmação) ou destacado ★.
- O app salva sozinho, sem botão "salvar". **[minha escolha]**

### 6.4 Oração
- **Três grupos fixos:** Pessoal · Pelos outros · Pelo mundo. **[Lori]**
- Dentro de cada grupo, a pessoa **cria as suas listas** (ex.: em "Pelos outros", "Família" e "Amigas da igreja"). Pode renomear e apagar listas. Apagar uma lista pede confirmação e avisa quantos pedidos ela tem. **[Lori: criar e editar listas; a organização por grupo é minha interpretação]**
- **Pedidos:** cada pedido tem um texto e a data em que foi criado. Pode ser editado, apagado (com confirmação) ou destacado ★.
- **Marcar como respondido:** tocar na caixinha grava a data, que pode ser mudada, e abre uma nota opcional, "como foi respondido". O pedido fica verde, com a data e a nota. Dá para desmarcar. **[Lori]**
- **Orações respondidas:** uma tela com todas as orações respondidas, da mais recente para a mais antiga, com data e nota. É um caderno de testemunhos. **[Lori]**

### 6.5 Buscar
- Uma única caixa de busca, com os filtros **Tudo** (padrão), **TTB**, **Devocional** e **Oração**. **[Lori]**
- A busca não diferencia acento nem letra maiúscula: "oracao" acha "Oração". **[minha escolha]**
- Cada resultado mostra um trecho com a palavra pintada, de onde veio e a data. Tocar no resultado abre o dia ou o pedido.
- A busca acontece dentro do próprio aparelho.

### 6.6 Resumo do mês
- Abre no mês atual, com setas para os meses anteriores. **[Lori]**
- Mostra:
  - **Agradecimentos:** quantos itens de TTB têm data nesse mês.
  - **Orações respondidas:** quantas foram marcadas como respondidas com data nesse mês, com a lista delas.
  - **Destaques:** quantas anotações desse mês estão com estrela, com a lista delas.
  - Quantos dias do mês tiveram devocional. **[minha escolha]**

### 6.7 Compartilhar
- Não é leitura ao vivo: compartilhar gera uma cópia que é enviada. **[Lori]**
- Dá para compartilhar o TTB e/ou o devocional de um dia, uma lista de oração, uma oração respondida ou o resumo do mês.
- O app monta um **texto organizado** (título, data e itens) e abre o botão de compartilhar do celular (WhatsApp, e-mail...). No computador, o texto é copiado para colar. **[minha escolha: texto; uma imagem bonita pode vir na versão 2]**
- Antes de enviar, a pessoa vê o texto e pode desistir.

### 6.8 Ajustes
- Idioma (Português / English). **[Lori]**
- Versículo do Início.
- Cópia de segurança: fazer cópia e restaurar cópia (seção 6.9).
- Lembrete diário: escolher o horário e criar o lembrete (seção 6.10).
- A troca de idioma muda botões e títulos. O que a pessoa escreveu não é traduzido.

### 6.9 Cópia de segurança **[Lori]**
- **Fazer cópia:** gera um único arquivo com tudo (diário, orações, versículo e ajustes). O nome do arquivo leva a data, por exemplo `TTBIT-copia-2026-11-03.json`. O app abre o botão de compartilhar do celular, para a pessoa guardar o arquivo no Google Drive, mandar para si mesma no WhatsApp ou salvar em Arquivos. No computador, o arquivo é baixado.
- O app guarda a data da última cópia para mostrar em Ajustes e para o aviso do Início (seção 6.2).
- **Restaurar cópia:** a pessoa escolhe o arquivo, e o app mostra o que ele contém (data da cópia e quantas anotações e pedidos). Restaurar **substitui tudo** o que está no aparelho. **[minha escolha: substituir é mais simples e seguro do que misturar]**
- **Aviso antes de restaurar** **[Lori, 03/11/2026]:** antes de qualquer mudança, aparece um aviso bem visível: "Restaurar vai **apagar tudo** o que está neste celular agora e colocar no lugar o conteúdo da cópia de [data]. Isso não pode ser desfeito." O aviso também mostra quantas anotações e pedidos existem hoje no aparelho. Ele oferece três botões: **"Fazer cópia do que tenho agora"** (recomendado), **"Restaurar mesmo assim"** e **"Cancelar"**.
- Se o arquivo não for uma cópia válida do TTBIT, o app avisa e não muda nada.
- O arquivo não tem senha. O texto fica legível para quem tiver o arquivo, e isso será dito na tela. **[minha escolha]**

### 6.10 Lembrete diário pelo calendário **[Lori, 03/11/2026]**
- O app não manda notificação sozinho, porque não tem servidor. Quem avisa é o **calendário do celular**.
- Em Ajustes, a pessoa escolhe o horário (padrão 21:00) e toca em "Criar lembrete diário". Aparecem duas opções:
  - **Google Agenda:** abre a tela de novo evento do Google Agenda já preenchida (repete todo dia, nesse horário, com aviso na hora). A pessoa só confirma. **[minha escolha]**
  - **Outro calendário (iPhone e outros):** o app gera um arquivo de calendário (.ics) com o mesmo evento, e o celular oferece adicioná-lo ao calendário. **[minha escolha]**
- Evento: título "🙏 TTBIT: escreva um agradecimento" (em inglês: "🙏 TTBIT: write one thing you're grateful for"), duração de 5 minutos, repetição diária, aviso na hora do evento, e o link do app na descrição.
- Para mudar o horário ou parar o lembrete, a pessoa edita ou apaga o evento no próprio calendário. A tela explica isso em uma frase.
- O único dado que vai para o Google Agenda é o horário e o título do lembrete. Nenhum texto do diário sai do celular.

## 7. Privacidade
- Os textos **nunca saem do aparelho**, a não ser quando a pessoa compartilha ou faz uma cópia. Ninguém vê nada, nem a Lori. **[Lori]**
- O app não usa contador de visitas, nem anúncios, nem nenhum serviço de fora que receba dados. **[minha escolha]**

## 8. Aparência
- Simples e elegante **[Lori]**, como nos exemplos em `proposta.html`: fundo creme, detalhes dourados suaves, títulos com letra serifada (com "pezinho", estilo livro), bastante espaço em branco e poucos botões por tela.
- Pensado primeiro para o celular, mas também funciona no computador.
- Letras de tamanho confortável e botões fáceis de tocar.

## 9. Onde o app fica no ar e custo
- O app fica num endereço gratuito do **GitHub Pages** (ex.: `usuario.github.io/ttbit`). **[minha escolha]**
- O GitHub Pages grátis exige que o código seja **público**. O código pode ser visto por qualquer um, mas os diários não, porque eles ficam só nos celulares.
- Se a Lori preferir o código privado, dá para usar outro serviço gratuito, como Netlify ou Cloudflare Pages. Isso fica para ela decidir na hora de publicar.
- Custo: zero.

## 10. O que fica para quem construir
- Ferramentas e bibliotecas: simples, gratuitas e avisadas à Lori antes de instalar.
- Como guardar os dados no aparelho (por exemplo, IndexedDB, o "armário" de dados do navegador) e o formato interno do arquivo de cópia. O formato deve ter um número de versão, para cópias antigas continuarem abrindo no futuro.
- Detalhes visuais finos, seguindo a seção 8.
- Texto exato dos botões em português e inglês.

## 11. Como saber que está pronto
- A Lori abre o link no celular e instala o app na tela inicial. No iPhone, aparece o aviso de instalação.
- Escreve 3 agradecimentos e 1 devocional hoje, destaca um e o vê no Início.
- Troca o versículo do Início.
- Cria uma lista em "Pelos outros", adiciona 2 pedidos e marca 1 como respondido, com nota. Ele aparece em Orações respondidas e no Resumo do mês.
- Busca uma palavra e acha o texto certo em cada filtro.
- Compartilha o dia por WhatsApp, e o texto chega organizado.
- Troca para inglês, e o app inteiro muda.
- Usa o app em modo avião, e tudo continua funcionando.
- Faz uma cópia, guarda no Drive, abre o app em outro aparelho, restaura e vê tudo igual.
- Ao restaurar, aparece o aviso de que tudo será substituído, e "Cancelar" não muda nada.
- Cria o lembrete às 21:00. No dia seguinte, o calendário avisa às 21:00, e o link abre o TTBIT.
- Tenta restaurar um arquivo qualquer, e o app recusa sem mudar nada.
- Uma amiga abre o mesmo link no celular dela e vê um diário vazio, só dela.
