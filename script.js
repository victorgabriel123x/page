/* ============================================================================
   CASA LENHA — comportamento

   1. Estado da casa ao vivo (aberto / falta X para abrir / fechado)
   2. Marca o dia de hoje na tabela de horários
   3. Revelação por scroll, discreta e desligada em prefers-reduced-motion
   4. Ano do rodapé

   A página funciona inteira sem este arquivo: o texto padrão do estado da casa
   e a tabela de horários já vêm no HTML.
   ========================================================================= */

/* ---------------------------------------------------------------------------
   HORÁRIOS — único lugar a editar quando o horário da casa mudar.
   Índice = dia da semana (0 domingo … 6 sábado).
   [abertura, fechamento] em minutos desde a meia-noite.
   Passar da meia-noite: use valores acima de 1440 (00h30 = 1470).
   ------------------------------------------------------------------------ */
var HORARIOS = {
  0: [720, 960],    // domingo    12h00 – 16h00
  1: null,          // segunda    fechado
  2: [1080, 1380],  // terça      18h00 – 23h00
  3: [1080, 1380],  // quarta
  4: [1080, 1380],  // quinta
  5: [1080, 1470],  // sexta      18h00 – 00h30
  6: [1080, 1470]   // sábado
};

var ULTIMO_PEDIDO = 30; // minutos antes de fechar
var DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function hhmm(minutos) {
  var m = ((minutos % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60);
  var min = m % 60;
  var hh = h === 0 ? "00" : String(h);   // 0h30 lê mal em português; 00h30 lê bem
  return min === 0 ? hh + "h" : hh + "h" + String(min).padStart(2, "0");
}

function duracao(minutos) {
  var h = Math.floor(minutos / 60);
  var m = minutos % 60;
  if (h === 0) return m + " min";
  if (m === 0) return h + "h";
  return h + "h" + String(m).padStart(2, "0");
}

/* Retorna { aberto, texto, calor } para um instante qualquer. */
function estadoDaCasa(agora) {
  var dia = agora.getDay();
  var min = agora.getHours() * 60 + agora.getMinutes();

  // Ainda dentro do serviço que começou ontem e passou da meia-noite?
  var ontem = HORARIOS[(dia + 6) % 7];
  if (ontem && ontem[1] > 1440 && min < ontem[1] - 1440) {
    var restaOntem = (ontem[1] - 1440) - min;
    return {
      aberto: true,
      texto: restaOntem <= ULTIMO_PEDIDO
        ? "Últimos pedidos · fechamos às " + hhmm(ontem[1])
        : "Servindo agora · último pedido às " + hhmm(ontem[1] - ULTIMO_PEDIDO),
      calor: 0.25
    };
  }

  var hoje = HORARIOS[dia];

  if (hoje && min >= hoje[0] && min < hoje[1]) {
    var progresso = (min - hoje[0]) / (hoje[1] - hoje[0]);
    var resta = hoje[1] - min;
    return {
      aberto: true,
      texto: resta <= ULTIMO_PEDIDO
        ? "Últimos pedidos · fechamos às " + hhmm(hoje[1])
        : "Servindo agora · último pedido às " + hhmm(hoje[1] - ULTIMO_PEDIDO),
      calor: Math.sin(progresso * Math.PI)
    };
  }

  if (hoje && min < hoje[0]) {
    return {
      aberto: false,
      texto: "Abrimos hoje às " + hhmm(hoje[0]) + " · faltam " + duracao(hoje[0] - min),
      calor: 0
    };
  }

  // Fechado: procura o próximo dia com serviço.
  for (var i = 1; i <= 7; i++) {
    var d = (dia + i) % 7;
    if (HORARIOS[d]) {
      var quando = i === 1 ? "amanhã" : DIAS[d];
      return {
        aberto: false,
        texto: "Fechado agora · abrimos " + quando + " às " + hhmm(HORARIOS[d][0]),
        calor: 0
      };
    }
  }

  return { aberto: false, texto: "Terça a domingo, a partir das 18h", calor: 0 };
}

function pintarEstado() {
  var caixa = document.getElementById("status");
  var texto = document.getElementById("status-texto");
  if (!caixa || !texto) return;

  var e = estadoDaCasa(new Date());

  // Só escreve quando a frase realmente muda. Reescrever o mesmo texto altera o
  // DOM e faz a região viva (role="status") reanunciar a cada minuto sem motivo.
  if (texto.textContent !== e.texto) texto.textContent = e.texto;

  caixa.style.setProperty("--heat", e.calor.toFixed(2));
  caixa.classList.toggle("is-open", e.aberto);
  caixa.classList.toggle("is-closed", !e.aberto);
}

function marcarHoje() {
  var dia = String(new Date().getDay());
  var linhas = document.querySelectorAll(".hours tr[data-dias]");
  for (var i = 0; i < linhas.length; i++) {
    var dias = linhas[i].getAttribute("data-dias").split(",");
    if (dias.indexOf(dia) !== -1) linhas[i].setAttribute("aria-current", "date");
  }
}

function revelar() {
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var alvos = document.querySelectorAll(
    ".section .eyebrow, .section .h2, .section .lede, .section .col-text p," +
    ".section .facts, .slot, .rung, .card, .hours, .contact, .section .btn"
  );

  if (reduzido || !("IntersectionObserver" in window)) return;

  // O atraso vem da posição do elemento dentro da própria seção, definido agora.
  // Se ficasse a cargo do índice do lote do observer, dois elementos vizinhos
  // receberiam o mesmo atraso e a sequência sairia embaralhada.
  var porSecao = {};
  for (var i = 0; i < alvos.length; i++) {
    var secao = alvos[i].closest("section");
    var chave = secao ? (secao.id || "sem-id") : "solto";
    porSecao[chave] = (porSecao[chave] || 0) + 1;
    alvos[i].classList.add("reveal");
    alvos[i].style.setProperty("--d", Math.min(porSecao[chave] - 1, 5) * 40 + "ms");
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-in");
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

  for (var j = 0; j < alvos.length; j++) observador.observe(alvos[j]);
}

/* Vídeo de fundo: quem pede movimento reduzido no sistema fica com o poster
   parado. Não faz nada enquanto não houver vídeo no hero. */
function acalmarVideo() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var videos = document.querySelectorAll(".hero__video");
  for (var i = 0; i < videos.length; i++) {
    videos[i].removeAttribute("autoplay");
    videos[i].pause();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  acalmarVideo();
  pintarEstado();
  setInterval(pintarEstado, 60000);
  marcarHoje();
  revelar();

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
});
