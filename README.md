# Casa Lenha — landing page de apresentação

Página única, sem cardápio, feita para apresentar a casa e levar à reserva.
HTML, CSS e JavaScript puros: nenhum build, nenhuma dependência. Abrir o
`index.html` no navegador já funciona.

```
index.html    estrutura e todo o conteúdo de texto
styles.css    tokens de cor/tipo/espaço e todos os componentes
script.js     estado da casa ao vivo, horários e revelação por scroll
assets/       coloque aqui logo, fotos e vídeos
```

---

## O que trocar quando a identidade visual chegar

### 1. Logo — 2 lugares no `index.html`

Procure por `class="wordmark"`. São duas ocorrências (topo e rodapé). Hoje o
logotipo é feito com tipografia. Para usar o arquivo da marca, troque o conteúdo
do link:

```html
<a class="wordmark" href="#topo" aria-label="Casa Lenha, início">
  <img src="assets/logo.svg" alt="Casa Lenha" height="28">
</a>
```

O do rodapé usa a classe extra `wordmark--foot` e aparece bem maior — use uma
altura maior lá (`height="72"`, por exemplo).

### 2. Cores — bloco `:root` no `styles.css`

Trocar estes seis valores re-veste a página inteira. Nenhum hex aparece solto
nos componentes.

| Token | Valor atual | Papel |
|---|---|---|
| `--carvao` | `#16110F` | fundo |
| `--fumaca` | `#241D19` | superfícies elevadas |
| `--fumaca-alta` | `#33291F` | bordas e divisões |
| `--cinza` | `#A79C91` | texto secundário |
| `--osso` | `#F4EFE7` | texto principal |
| `--brasa` | `#D2601A` | acento e botões |
| `--incandescente` | `#FFD9A0` | pico de calor, uso raro |

Ao trocar, confira o contraste: texto pequeno precisa de 4.5:1 contra o fundo.
Os pares atuais estão todos acima disso.

### 3. Tipografia — `--display`, `--texto` e `--mono` no `:root`

As fontes vêm do Google Fonts pelo `<link>` no `<head>`. Se a marca tiver
tipografia própria, troque o `<link>` e os três tokens. As três funções são:
display (títulos), texto (corpo) e mono (horários, temperaturas, botões).

### 4. Fotos e vídeos

Cada espaço de mídia é um `<figure class="slot">` com um `data-slot` que o
identifica, e dentro dele um `<div class="slot__ph">` com o rótulo e as
dimensões sugeridas. **Troque o `div` inteiro por uma imagem:**

```html
<figure class="slot slot--a" data-slot="salao-01">
  <img src="assets/salao-01.jpg" alt="O salão visto da entrada, com a grelha ao fundo">
</figure>
```

A proporção já está reservada no CSS, então a página não dá salto ao carregar.
Para vídeo, use `<video muted loop playsinline poster="...">` no mesmo lugar.

| `data-slot` | Onde | Formato sugerido |
|---|---|---|
| `casa-fogo` | seção "A casa" | vertical, 1200 × 1600 |
| `salao-01` | galeria, coluna alta | vertical, 1400 × 1900 |
| `salao-02` | galeria, faixa larga | horizontal, 1600 × 1100 |
| `salao-03` | galeria, quadrado | 1200 × 1200 |
| `salao-04` | galeria, vídeo curto | horizontal, 1920 × 1080, até 15s, mudo |
| `mapa` | seção "Visite" | `iframe` do Google Maps ou imagem 4:5 |

Escreva um `alt` que descreva a foto para quem não a vê. Não repita o nome do
restaurante em todos.

### 5. Vídeo de fundo do hero

No `index.html`, dentro de `<section class="hero">`, existe um bloco de vídeo
comentado. Descomente e aponte para o arquivo. Enquanto não houver vídeo, o
fundo de brasa em CSS assume o lugar — a página não fica com buraco.

### 6. Textos de contato

Endereço, telefone, WhatsApp e e-mail estão na seção `#visite` e no rodapé.
Procure por `0000-0000`, `wa.me/5511000000000`, `casalenha.com.br` e
`Rua da Lenha, 000`.

### 7. Horários

Dois lugares, e os dois precisam concordar:

- **`index.html`**, tabela `.hours` — o que a pessoa lê.
- **`script.js`**, objeto `HORARIOS` no topo — o que alimenta o aviso de
  "servindo agora / abrimos às ...". Índice 0 é domingo, valores em minutos
  desde a meia-noite. Passar da meia-noite usa valores acima de 1440
  (00h30 = 1470).

---

## Decisões que valem preservar

- **O aviso de estado da casa** (o "servindo agora · último pedido às 22h30" no
  topo) é informação de verdade, calculada na hora, e é o que diferencia esta
  página. Sem JavaScript ela mostra o horário genérico e continua correta.
- **A escada de calor** na seção "O fogo" é o elemento que a página deixa na
  memória. A coluna esquenta de cima para baixo e termina na brasa: a ordem é
  física, não decorativa. Se mudar as alturas, mantenha o `--heat` de cada
  degrau coerente (0 = frio, 1 = quente).
- **As seções são marcadas por horário de serviço** (17:00 o fogo acende →
  23:00 último pedido), não por números 01/02/03. Se acrescentar seção, dê a ela
  um horário que faça sentido na noite.
- **Sem cardápio**, conforme combinado. Os textos falam de método e de casa, não
  de pratos.

## Qualidade verificada

Contraste AA em todos os textos, foco de teclado visível, alvos de toque de
44px, sem rolagem horizontal em 390px e 1440px, `prefers-reduced-motion`
respeitado, proporções reservadas para não haver salto de layout, e a página
funciona com o JavaScript desligado.
