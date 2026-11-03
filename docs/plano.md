# TTBIT v1 — Plano de construção

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o TTBIT v1: um diário de fé (TTB, Devocional, Oração) que funciona como app no celular, guarda tudo só no aparelho e tem cópia de segurança.

**Architecture:** É um site estático que funciona como app (PWA), feito em JavaScript simples, sem framework. Os dados ficam no IndexedDB do navegador, atrás de um módulo `store`. A lógica (busca, resumo, "neste dia", cópia, texto de compartilhar) fica em funções puras testadas com Vitest. As telas são módulos que desenham HTML a partir de um retrato dos dados, com navegação por `#hash`. O app fica no ar pelo GitHub Pages, publicado por GitHub Actions.

**Tech Stack:** Node 24 (já instalado), Vite 6 (servidor local e empacotamento), Vitest 3 + jsdom + fake-indexeddb (só para testes). Nada disso vai para o celular de ninguém: são ferramentas de construção. O service worker é escrito à mão, sem plugin.

**Spec:** `G:\My Drive\CLAUDE LORI\Pessoal\Projetos\TTBIT\design.md`. Uma cópia fica em `docs/design.md` no repositório.

**Onde fica o código:** `C:\Users\tanko\Documents\ttbit`, um repositório git. O GitHub é `lorilee87/ttbit`, público, criado só na Tarefa 15 e depois de a Lori confirmar.

## Global Constraints
- Custo zero. Nenhum serviço externo recebe dados. Sem analytics, sem fontes ou scripts de CDN em tempo de uso: tudo é servido pelo próprio app.
- Só texto. Sem fotos.
- Tudo fica no aparelho (IndexedDB). Sem login e sem servidor.
- Idiomas `pt` e `en`. O padrão vem de `navigator.language`: começa com "pt" → `pt`; qualquer outro → `en`.
- Datas de anotação são a data **local** do aparelho, no formato `YYYY-MM-DD`, nunca UTC.
- Versículo inicial (enquanto `settings.verse` for null):
  - pt: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." / "1 Tessalonicenses 5:18"
  - en: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you." / "1 Thessalonians 5:18"
- Visual: fundo `#f7f3ec`, cartão `#fffdf9`, texto `#2b2620`, texto suave `#7a7065`, linha `#e6ddd0`, dourado `#b08a4a`, dourado claro `#f3e9d6`, verde `#5f7f63`, verde claro `#e5eee4`. Títulos em Georgia (serifada). Corpo na fonte do sistema. Referência visual: `design.html`.
- Celular primeiro: nada passa da largura em 375px; alvos de toque com pelo menos 44px.
- Apagar qualquer coisa pede confirmação.
- Antes de cada `npm install`, avisar a Lori o que é e para quê.

## Review Focus
1. **Arquivo de restaurar quebrado, de outro app ou de versão futura** → recusar com aviso e não mudar nada. Teste na Tarefa 6.
2. **"Neste dia" em 31/03, 29/02 ou 31/12** → 1 mês antes de 31/03 é 28/02 (ou 29/02 em ano bissexto). Não pode pular para março nem dar erro. Teste na Tarefa 2.
3. **Escrever às 23h30 no Brasil** → a anotação fica no dia local, não no dia seguinte em UTC. Teste na Tarefa 2.
4. **Busca vazia ou só com espaços** → nenhum resultado. Não pode mostrar tudo. Teste na Tarefa 4.
5. **Apagar uma lista que tem pedidos** → os pedidos dela também são apagados, e nada fica "órfão" na busca ou no resumo. Teste na Tarefa 3.

---

## Modelo de dados (compartilhado por todas as tarefas)

Banco IndexedDB `ttbit`, versão 1. Cada store usa `keyPath: 'id'`:

```js
// ttb:          { id, date:'YYYY-MM-DD', text, order:number, starred:boolean, createdAt:ISO, updatedAt:ISO }
// devotionals:  { id:'YYYY-MM-DD', date:'YYYY-MM-DD', text, starred:boolean, updatedAt:ISO }   // um por dia
// lists:        { id, group:'personal'|'others'|'world', name, createdAt:ISO }
// prayers:      { id, listId, text, date:'YYYY-MM-DD', starred:boolean, answeredDate:'YYYY-MM-DD'|null, answerNote:string, updatedAt:ISO }
// settings:     { id:'main', lang:'pt'|'en', verse:{text,ref}|null, lastBackupAt:ISO|null, iosHintDismissed:boolean, reminderTime:'HH:MM' }  // padrão '21:00'
```

O **retrato** (`Snapshot`) que as funções puras recebem tem esta forma:
`{ ttb:[], devotionals:[], lists:[], prayers:[], settings:{...} }`

Os ids são gerados com `crypto.randomUUID()`.

---

### Tarefa 1: Projeto, ferramentas e primeiro teste

**Files:**
- Create: `C:\Users\tanko\Documents\ttbit\` com `package.json`, `.gitignore`, `vite.config.js`, `index.html` (só "TTBIT"), `src/main.js`, `docs/design.md` (cópia do design), `CONTEXTO.md`
- Test: `tests/smoke.test.js`

- [ ] **Passo 1:** Avisar a Lori: "Vou instalar Vite (monta e mostra o app no computador enquanto construo), Vitest, jsdom e fake-indexeddb (testam o app sozinhos). Ficam só nesta pasta e são grátis." Esperar o ok dela.
- [ ] **Passo 2:** `git init`, `npm init -y`, depois `npm i -D vite@6 vitest@3 jsdom fake-indexeddb`. Em `package.json`, os scripts são `"dev":"vite"`, `"build":"vite build"`, `"test":"vitest run"` e `"type":"module"`. Em `vite.config.js`: `base: './'` e `test: { environment: 'jsdom', setupFiles: ['fake-indexeddb/auto'] }`. No `.gitignore`: `node_modules`, `dist`, `.env`.
- [ ] **Passo 3:** Escrever o teste `tests/smoke.test.js`: `expect(1+1).toBe(2)` e `expect(typeof indexedDB).toBe('object')`.
- [ ] **Passo 4:** Rodar `npm test`. Esperado: 2 testes passam.
- [ ] **Passo 5:** Commit: `chore: cria projeto TTBIT com Vite e Vitest`.

### Tarefa 2: Datas e texto sem acento

**Files:** Create `src/lib/dates.js`, `src/lib/normalize.js` · Test `tests/dates.test.js`, `tests/normalize.test.js`

**Interfaces — Produces:**
- `localISODate(d: Date) -> 'YYYY-MM-DD'`: data local.
- `addMonthsClamped(iso: string, n: number) -> string`: n pode ser negativo. O dia é cortado no último dia do mês de destino.
- `monthOf(iso) -> 'YYYY-MM'`
- `formatLongDate(iso, lang) -> string`: pt "terça-feira, 3 de novembro" / en "Tuesday, November 3", via `Intl.DateTimeFormat`, ancorado ao meio-dia local para não mudar o dia.
- `normalize(s: string) -> string`: minúsculas e sem acentos (`NFD` + remoção de `\p{M}`).

- [ ] **Passo 1: Testes que falham:**
```js
expect(localISODate(new Date(2026,10,3,23,30))).toBe('2026-11-03')          // 23h30 local
expect(addMonthsClamped('2026-03-31',-1)).toBe('2026-02-28')
expect(addMonthsClamped('2028-03-31',-1)).toBe('2028-02-29')
expect(addMonthsClamped('2027-02-28',-12)).toBe('2026-02-28')
expect(addMonthsClamped('2028-02-29',-12)).toBe('2027-02-28')
expect(addMonthsClamped('2026-01-15',-6)).toBe('2025-07-15')
expect(monthOf('2026-11-03')).toBe('2026-11')
expect(formatLongDate('2026-11-03','pt')).toBe('terça-feira, 3 de novembro')   // ajustar à saída real do Intl, mantendo dia e mês
expect(normalize('Oração PACIÊNCIA')).toBe('oracao paciencia')
```
- [ ] **Passo 2:** `npm test`. Esperado: FALHA (funções não existem).
- [ ] **Passo 3:** Implementar.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: datas locais e normalização de texto`.

### Tarefa 3: Store (IndexedDB)

**Files:** Create `src/store.js` · Test `tests/store.test.js`

**Interfaces — Produces** (todas as funções são `async`):
- `openStore() -> void`: abre/cria o banco `ttbit` v1 com os 5 stores.
- `getSnapshot() -> Snapshot`: `settings` vem preenchido com o padrão se não existir (`lang` por `detectLang()` da Tarefa 7, que nesta tarefa pode ser injetado como `'pt'`).
- `saveSettings(partial) -> Settings`
- `addTTB(date, text) -> TTB` (`order` = maior order do dia + 1) · `updateTTB(id, {text?, starred?})` · `deleteTTB(id)`
- `saveDevotional(date, {text?, starred?}) -> Devotional` (cria ou atualiza; se o texto ficar vazio e não houver estrela, apaga)
- `addList(group, name) -> List` · `renameList(id, name)` · `deleteList(id)` (**apaga junto os pedidos da lista, numa só transação**)
- `addPrayer(listId, text, date) -> Prayer` · `updatePrayer(id, {text?, starred?, answeredDate?, answerNote?})` · `deletePrayer(id)`
- `replaceAll(data: Snapshot) -> void`: limpa os 5 stores e grava `data` **numa só transação**.

- [ ] **Passo 1: Testes que falham** (antes de cada teste, apagar o banco com `indexedDB.deleteDatabase('ttbit')`):
  - `addTTB` duas vezes no mesmo dia → `order` 1 e 2; `getSnapshot().ttb.length === 2`.
  - `saveDevotional('2026-11-03',{text:'a'})` duas vezes → um só registro.
  - `deleteList` numa lista com 2 pedidos → `prayers.length === 0`, e os pedidos de outra lista continuam.
  - `replaceAll(x)` seguido de `getSnapshot()` → igual a `x`.
  - `getSnapshot().settings.verse === null` num banco novo.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA.
- [ ] **Passo 3:** Implementar com a API nativa do IndexedDB (sem biblioteca) e um helper `tx(stores, mode, fn)` que devolve uma Promise.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: armazenamento local no IndexedDB`.

### Tarefa 4: Busca

**Files:** Create `src/lib/search.js` · Test `tests/search.test.js`

**Interfaces — Produces:** `search(snap: Snapshot, query: string, filter: 'all'|'ttb'|'devotional'|'prayer') -> Result[]`
`Result = { type:'ttb'|'devotional'|'prayer', id, date, text, matchStart, matchEnd }`. Os resultados vêm ordenados por `date`, do mais recente ao mais antigo. Nos pedidos, a busca olha `text` e `answerNote`. `matchStart` e `matchEnd` são posições no texto **original**. Como a normalização com NFD mantém um caractere por caractere em português, as posições do texto normalizado servem para o original.

- [ ] **Passo 1: Testes que falham:**
  - "paciencia" acha "Paciência com a equipe" (`type 'prayer'`) e o devocional "me dá paciência"; com `filter:'ttb'` → 0.
  - `search(snap,'   ','all')` → `[]`; `search(snap,'','all')` → `[]`.
  - Os resultados vêm em ordem de data decrescente.
  - Para "Paciência com…" com query "pacien": `matchStart===0`, `matchEnd===6`.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA.
- [ ] **Passo 3:** Implementar.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: busca por palavra`.

### Tarefa 5: "Neste dia", destaques e resumo do mês

**Files:** Create `src/lib/highlights.js`, `src/lib/summary.js` · Test `tests/highlights.test.js`, `tests/summary.test.js`

**Interfaces — Produces:**
- `onThisDay(snap, todayISO) -> [{ period:'1m'|'6m'|'1y', date, ttb:TTB[], devotional:Devotional|null }]`: inclui só os períodos que têm algo e usa `addMonthsClamped` com -1, -6 e -12.
- `starredItems(snap, limit?) -> [{type, id, date, text}]`: junta TTB, devocionais e pedidos com estrela, do mais recente ao mais antigo.
- `answeredPrayers(snap) -> Prayer[]`: os que têm `answeredDate`, ordenados por `answeredDate` decrescente.
- `monthSummary(snap, 'YYYY-MM') -> { gratitude:number, answered:Prayer[], starred:Item[], devotionalDays:number }`: `gratitude` conta os TTB com `date` no mês; `answered` usa `answeredDate` no mês; `starred` traz os itens com estrela cuja `date` está no mês; `devotionalDays` conta os devocionais com texto não vazio no mês.

- [ ] **Passo 1: Testes que falham:**
  - Hoje é '2026-11-03', e existe TTB em '2026-10-03' e em '2025-11-03' → períodos `['1m','1y']`.
  - Hoje é '2026-03-31', e existe TTB em '2026-02-28' → aparece em `'1m'`.
  - `monthSummary` de '2026-10' com 3 TTB em outubro, 1 em novembro, 1 pedido respondido em '2026-10-20' (criado em setembro) e 2 devocionais em outubro → `{gratitude:3, answered.length:1, devotionalDays:2}`.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA.
- [ ] **Passo 3:** Implementar.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: neste dia, destaques e resumo do mês`.

### Tarefa 6: Cópia de segurança (lógica)

**Files:** Create `src/lib/backup.js` · Test `tests/backup.test.js`

**Interfaces — Produces:**
- `buildBackup(snap, now: Date) -> { app:'TTBIT', version:1, createdAt:ISO, data:Snapshot }`
- `backupFileName(now) -> 'TTBIT-copia-YYYY-MM-DD.json'`: com data local.
- `parseBackup(text: string) -> { ok:true, backup, counts:{entries, prayers} } | { ok:false, error:'invalid'|'notTtbit'|'newerVersion' }`. `entries` = número de TTB + número de devocionais.
- `countSnapshot(snap) -> { entries, prayers }`
- `needsBackupReminder(snap, now) -> boolean`: true se `lastBackupAt` tiver mais de 30 dias, ou se for null e existir anotação (TTB, devocional ou pedido) com `date` de mais de 7 dias atrás.

- [ ] **Passo 1: Testes que falham:**
  - `parseBackup(JSON.stringify(buildBackup(snap, now)))` → `ok:true`, com os mesmos dados.
  - `parseBackup('não é json')` → `{ok:false, error:'invalid'}`.
  - `parseBackup('{"app":"Outro"}')` → `'notTtbit'`.
  - `parseBackup` de uma cópia com `version:2` → `'newerVersion'`.
  - `parseBackup` de uma cópia sem o array `data.ttb` → `'invalid'`.
  - `needsBackupReminder`: última cópia há 31 dias → true; há 10 dias → false; sem cópia e só anotação de hoje → false.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA.
- [ ] **Passo 3:** Implementar.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: cópia de segurança (lógica)`.

### Tarefa 7: Idiomas e texto de compartilhar

**Files:** Create `src/i18n.js`, `src/lib/shareText.js` · Test `tests/i18n.test.js`, `tests/shareText.test.js`

**Interfaces — Produces:**
- `detectLang(navLang: string) -> 'pt'|'en'`
- `setLang(lang)` · `t(key: string, vars?: object) -> string`: se faltar a tradução em `en`, usa `pt`; se a chave não existir em nenhum, devolve a própria chave.
- `strings = { pt:{...}, en:{...} }`: todas as frases das telas. Cada tarefa de tela acrescenta as suas chaves.
- `shareDay(date, ttb:TTB[], devotional|null, lang) -> string` · `shareList(list, prayers, lang)` · `shareAnswered(prayer, lang)` · `shareSummary(month, summary, lang)`

Formato fixo de `shareDay` em pt (no `en`, o mesmo formato em inglês):
```
🙏 TTBIT · terça-feira, 3 de novembro

Agradeço por:
1. Café da manhã com meu marido
2. Uma cliente que voltou

Devocional:
<texto>
```
Uma seção vazia não aparece.

Também nesta tarefa, `src/lib/reminder.js` (design 6.10). O evento começa amanhã, no horário escolhido, e dura 5 minutos:
- `reminderICS(time:'HH:MM', lang, appUrl, now:Date) -> string`: VCALENDAR com um VEVENT. `DTSTART` e `DTEND` usam hora local "flutuante" (sem `Z`), `RRULE:FREQ=DAILY`, `SUMMARY` igual ao título do design, `DESCRIPTION` com `appUrl`, `VALARM` com `TRIGGER:PT0M`, `UID` igual a `ttbit-reminder@ttbit`, e linhas terminadas em `\r\n`.
- `reminderGoogleUrl(time, lang, appUrl, now, tz = Intl.DateTimeFormat().resolvedOptions().timeZone) -> string`: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMM00/YYYYMMDDTHHMM00&ctz=<tz>&recur=RRULE:FREQ=DAILY&details=<appUrl>`.

- [ ] **Passo 1: Testes que falham:** `detectLang('pt-BR')==='pt'`, `detectLang('en-US')==='en'`, `detectLang('es')==='en'`; `shareDay` com 2 TTB e sem devocional não contém "Devocional"; `shareSummary` contém os 4 números; `reminderICS('21:00','pt',url,new Date(2026,10,3,10,0))` contém `DTSTART:20261104T210000`, `DTEND:20261104T210500`, `RRULE:FREQ=DAILY`, `TRIGGER:PT0M` e não contém `Z\r\n`; `reminderGoogleUrl` com tz `'America/Sao_Paulo'` contém `dates=20261104T210000%2F20261104T210500` (ou a barra sem codificar) e `recur=RRULE%3AFREQ%3DDAILY`; `reminderICS('23:58',…)` termina às `T000300` do dia seguinte.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA.
- [ ] **Passo 3:** Implementar.
- [ ] **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5:** Commit: `feat: idiomas, texto de compartilhar e lembrete de calendário`.

### Tarefa 8: Esqueleto do app, navegação e Ajustes

**Files:** Create `src/styles.css`, `src/router.js`, `src/ui/shell.js`, `src/ui/settings.js`, `src/ui/dom.js` · Modify `index.html`, `src/main.js` · Test `tests/router.test.js`

**Interfaces — Produces:**
- `src/ui/dom.js`: `h(tag, attrs, ...children) -> HTMLElement` (helper para montar elementos; o texto entra sempre como `textContent`, nunca como `innerHTML` com dados da pessoa) · `confirmDialog(message, buttons:[{label, value, primary?}]) -> Promise<value>`.
- `src/router.js`: `parseRoute(hash) -> {name, params}` para as rotas `#/` (home), `#/diary/YYYY-MM-DD/ttb|devotional`, `#/prayer/personal|others|world`, `#/answered`, `#/search`, `#/summary/YYYY-MM`, `#/settings` e `#/starred`. Um hash desconhecido vai para home.
- `src/ui/shell.js`: `renderApp(root, route, snap)`: barra de topo (TTBIT + ⚙), área da tela e barra de baixo (Início, Diário, Oração, Buscar). Depois de qualquer gravação, a tela chama `refresh()`, que lê o snapshot de novo e redesenha.
- Cada tela: `export function render(params, snap, ctx) -> HTMLElement`, com `ctx = { store, refresh, navigate }`.
- Ajustes: idioma (troca na hora), versículo (texto em várias linhas + referência; "voltar ao padrão" deixa `verse:null`) e um bloco "Cópia de segurança" que por enquanto só tem os botões, sem ação (a Tarefa 13 liga).

- [ ] **Passo 1: Teste que falha:** `parseRoute('#/diary/2026-11-03/ttb')` → `{name:'diary', params:{date:'2026-11-03', tab:'ttb'}}`; `parseRoute('#/xyz')` → `{name:'home'}`; `parseRoute('#/diary/abc/ttb')` → `{name:'home'}`.
- [ ] **Passo 2:** `npm test`. Esperado: FALHA. **Passo 3:** Implementar. **Passo 4:** `npm test`. Esperado: PASSA.
- [ ] **Passo 5: Ver no navegador:** `npm run dev`, abrir no painel em 375px. A barra de baixo funciona; em Ajustes, trocar para English muda a barra; trocar o versículo e recarregar mantém o novo versículo.
- [ ] **Passo 6:** Commit: `feat: esqueleto do app, navegação e ajustes`.

### Tarefa 9: Tela Início

**Files:** Create `src/ui/home.js`, `src/ui/starred.js`

**Interfaces — Consumes:** `starredItems`, `onThisDay` (Tarefa 5), `needsBackupReminder` (Tarefa 6), `formatLongDate` (Tarefa 2).

A tela segue a seção 6.2 do design. O versículo usa `settings.verse` ou o padrão do idioma. A seção Destaques mostra até 3 itens e "ver todos" leva para `#/starred`, que lista todos os destaques. "Neste dia" só aparece se existir algo. O aviso de cópia só aparece se `needsBackupReminder` for true. Tocar num item abre o dia ou a lista dele.

- [ ] **Passo 1: Ver no navegador** com dados de teste. Criar `src/dev/seed.js` com `seed(store)`, que só roda pelo console e nunca no app publicado. Conferir: versículo, + TTB e + Devocional, destaques, "neste dia" com um TTB de 1 mês atrás e o aviso de cópia.
- [ ] **Passo 2:** Commit: `feat: tela início`.

### Tarefa 10: Diário (TTB e Devocional)

**Files:** Create `src/ui/diary.js`

O diário segue a seção 6.3 do design. As setas ‹ › mudam o dia, e tocar na data abre um `<input type="date">`. No TTB: lista numerada; tocar num item permite editar; ☆/★ marca destaque; apagar pede confirmação; "+ escrever mais um" abre um campo novo. No Devocional: um `<textarea>` que salva sozinho 800 ms depois que a pessoa para de digitar e também ao sair da tela. Aparece "salvo automaticamente". O botão "Compartilhar o dia" fica para ligar na Tarefa 13.

- [ ] **Passo 1: Ver no navegador:** escrever 3 TTB e 1 devocional, destacar 1, recarregar e conferir que tudo ficou; ir para ontem, escrever e voltar.
- [ ] **Passo 2:** Commit: `feat: diário TTB e devocional`.

### Tarefa 11: Oração e Orações respondidas

**Files:** Create `src/ui/prayer.js`, `src/ui/answered.js`

A tela segue a seção 6.4 do design. Abas: Pessoal, Pelos outros, Mundo. As listas aparecem em ordem de criação. "+ nova lista" pede um nome. Cada lista tem o menu renomear/apagar; apagar avisa "Esta lista tem N pedidos" antes de confirmar. Marcar a caixinha abre um diálogo com a data (hoje, editável) e a nota opcional. Desmarcar limpa `answeredDate` e `answerNote`. Em `#/answered`, os pedidos aparecem por `answeredPrayers`, com o nome da lista e o grupo.

- [ ] **Passo 1: Ver no navegador:** criar a lista "Família" em "Pelos outros" com 2 pedidos; responder 1 com nota; ver o pedido em Respondidas; apagar a lista e conferir que os pedidos somem da busca.
- [ ] **Passo 2:** Commit: `feat: listas de oração e respondidas`.

### Tarefa 12: Telas Buscar e Resumo do mês

**Files:** Create `src/ui/searchView.js`, `src/ui/summaryView.js`

Busca: a caixa busca enquanto a pessoa digita (espera de 200 ms). Os botões Tudo, TTB, Devocional e Oração filtram. O trecho mostra até 40 caracteres antes e depois da palavra, com a palavra dentro de `<mark>`. O texto é montado com nós (`textContent`), nunca com `innerHTML`. Tocar num resultado abre o dia ou a aba do grupo da lista.
Resumo: 4 números em grade 2×2, as listas de respondidas e de destaques do mês, e as setas ‹ › de mês. Não vai além do mês atual.

- [ ] **Passo 1: Ver no navegador:** buscar "paciencia" sem acento e achar os textos com acento; filtrar por Oração; abrir o resumo de outubro com os dados de teste e conferir os números à mão.
- [ ] **Passo 2:** Commit: `feat: busca e resumo do mês`.

### Tarefa 13: Compartilhar, cópia, restaurar e lembrete

**Files:** Create `src/ui/share.js`, `src/ui/backupUI.js`, `src/ui/reminderUI.js` · Modify `src/ui/diary.js`, `src/ui/prayer.js`, `src/ui/answered.js`, `src/ui/summaryView.js`, `src/ui/settings.js`

**Interfaces — Produces:**
- `openShare(text: string)`: mostra a prévia com os botões Cancelar e Enviar. Enviar usa `navigator.share({text})`; se não houver, copia com `navigator.clipboard.writeText` e avisa "Copiado".
- `makeBackup(ctx)`: `buildBackup` → `File` JSON → `navigator.share({files})` se `navigator.canShare({files})`; se não, baixa por `<a download>`. Depois grava `lastBackupAt`.
- `restoreBackup(ctx)`: `<input type=file accept=".json,application/json">` → `parseBackup`. Se der erro, mostra a mensagem do erro e não muda nada. Se der certo, mostra o **aviso de restaurar** com o texto do design 6.9 e os botões "Fazer cópia do que tenho agora", "Restaurar mesmo assim" e "Cancelar". "Fazer cópia…" chama `makeBackup` e volta para o mesmo aviso. Só "Restaurar mesmo assim" chama `replaceAll`.

- `src/ui/reminderUI.js` · `openReminder(ctx)`: em Ajustes, um `<input type="time">` (grava `reminderTime`) e o botão "Criar lembrete diário". O botão abre duas opções: "Google Agenda" (`window.open(reminderGoogleUrl(...))`) e "Outro calendário" (arquivo `TTBIT-lembrete.ics` com `type:'text/calendar'`, por `navigator.share({files})` ou download). Uma frase explica: "Para mudar ou parar, edite o evento no seu calendário."

- [ ] **Passo 1: Ver no navegador:** criar o lembrete pelo Google Agenda e conferir que a tela do evento abre com o horário e a repetição diária; baixar o .ics e abrir para conferir o conteúdo; compartilhar o dia (no computador, deve copiar); fazer a cópia, apagar o banco pelo DevTools, restaurar e conferir que tudo voltou; restaurar um `.json` qualquer e ver a recusa; no aviso, "Cancelar" não muda nada.
- [ ] **Passo 2:** Commit: `feat: compartilhar e cópia de segurança`.

### Tarefa 14: App instalável e sem internet

**Files:** Create `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`, `src/ui/iosHint.js` · Modify `index.html`, `src/main.js`

- Manifest: `name:"TTBIT"`, `display:"standalone"`, `background_color:"#f7f3ec"`, `theme_color:"#f7f3ec"`, `start_url:"./"`.
- Ícone: "T" dourado em Georgia sobre o fundo creme, gerado como PNG a partir de um SVG feito à mão.
- `sw.js`: no `install`, guarda em cache o `index.html` e os arquivos do build (lista gerada no build). Responde do cache primeiro e busca na rede em segundo plano. O nome do cache leva a versão.
- `main.js`: registra o service worker e chama `navigator.storage?.persist?.()` uma vez.
- `iosHint`: aparece se o aparelho for iOS, não estiver instalado (`!navigator.standalone`) e `!settings.iosHintDismissed`. Mostra o texto do `design.html`, e "Agora não" grava `iosHintDismissed:true`.

- [ ] **Passo 1:** `npm run build && npx vite preview`, abrir no painel, ligar o modo offline no DevTools, recarregar e conferir que o app abre e os dados aparecem.
- [ ] **Passo 2:** `npm test`. Esperado: todos passam.
- [ ] **Passo 3:** Commit: `feat: app instalável e funcionando sem internet`.

### Tarefa 15: Publicar no GitHub Pages

**Files:** Create `.github/workflows/deploy.yml`, `README.md`

- [ ] **Passo 1:** **Perguntar à Lori** antes de criar o repositório público `lorilee87/ttbit` (é público, e o código fica visível). Esperar o sim.
- [ ] **Passo 2:** O workflow: em push na `main` → `npm ci`, `npm test`, `npm run build` → `actions/upload-pages-artifact` (pasta `dist`) → `actions/deploy-pages`.
- [ ] **Passo 3:** `gh repo create lorilee87/ttbit --public --source . --push`, depois ligar o Pages com a fonte "GitHub Actions" (`gh api -X POST repos/lorilee87/ttbit/pages -f build_type=workflow`).
- [ ] **Passo 4:** Abrir `https://lorilee87.github.io/ttbit/` no painel em 375px e repetir a lista "Como saber que está pronto" do design, seção 11, nos itens que dão para testar no computador. Os itens de celular a Lori confere no aparelho dela.
- [ ] **Passo 5:** Commit e push: `chore: publica no GitHub Pages`. Atualizar o `CONTEXTO.md` do projeto e o do Drive.
