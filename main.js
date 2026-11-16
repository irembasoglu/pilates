// Video ve fotoğraf büyütme penceresi
var box = document.getElementById('lightbox');
var content = document.getElementById('lightbox-content');
function openBox(html) { content.innerHTML = html; box.hidden = false; }
function closeBox() { content.innerHTML = ''; box.hidden = true; }

document.querySelectorAll('.trainer').forEach(function (b) {
  b.onclick = function () {
    openBox('<video src="' + b.dataset.video + '" poster="' + b.dataset.poster + '" controls autoplay playsinline></video>');
  };
});
document.querySelectorAll('.photo').forEach(function (b) {
  b.onclick = function () {
    var img = b.querySelector('img');
    openBox('<img src="' + img.src + '" alt="' + img.alt + '">');
  };
});
box.onclick = function (e) { if (e.target === box || e.target.className === 'lightbox-close') closeBox(); };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });

// Hareket azaltma tercihi olanlarda kapak videoları durur
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.trainer-photo video').forEach(function (v) { v.pause(); });
}

// Kaydırınca menü incelir ve buzlu cama döner
function navDurumu() { document.body.classList.toggle('scrolled', window.scrollY > 40); }
window.addEventListener('scroll', navDurumu, { passive: true });
navDurumu();

// Google yorumları: ileri-geri butonları
var yorumlar = document.querySelector('.review-track');
if (yorumlar) {
  var btns = document.querySelectorAll('.review-btn');
  function yorumButonlari() {
    var max = yorumlar.scrollWidth - yorumlar.clientWidth - 4;
    btns[0].disabled = yorumlar.scrollLeft <= 4;
    btns[1].disabled = yorumlar.scrollLeft >= max;
  }
  btns.forEach(function (b) {
    b.onclick = function () { yorumlar.scrollBy({ left: Number(b.dataset.yon) * yorumlar.clientWidth, behavior: 'smooth' }); };
  });
  yorumlar.addEventListener('scroll', yorumButonlari, { passive: true });
  yorumButonlari();
}

// Duyuru bandı: kapatılınca o duyuru bir daha gösterilmez
(function () {
  var band = document.getElementById('duyuru');
  if (!band) return;
  var key = 'duyuru-kapandi-' + band.dataset.id;
  try { if (localStorage.getItem(key)) band.remove(); } catch (e) {}
  var btn = band.querySelector('.announce-close');
  if (btn) btn.onclick = function () {
    band.remove();
    try { localStorage.setItem(key, '1'); } catch (e) {}
  };
})();

// Ücretsiz deneme dersi penceresi: ders, gün ve saat seçilince WhatsApp mesajı hazırlanır
var Deneme = (function () {
  var box = document.getElementById('trial');
  if (!box) return { ac: function () {} };
  var TEL = '905374989178';
  var GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var GRUP = { pilates: 'Aletli Pilates', yoga: 'Yoga', zumba: 'Zumba' };
  var AD = { pilates: 'Aletli Pilates', yoga: 'Yoga', zumba: 'Zumba', hamile: 'Hamile Pilatesi', ozel: 'Özel Ders', duet: 'Düet Ders' };
  var ZAMAN = [['Sabah', '08:00 – 12:00'], ['Öğle', '12:00 – 17:00'], ['Akşam', '17:00 – 22:30']];
  var program = window.PROGRAM || [];
  var secim = {}, sonOdak = null;
  var steps = box.querySelectorAll('.trial-step');
  var gunAlan = box.querySelector('[data-alan="gun"]'), saatAlan = box.querySelector('[data-alan="saat"]');
  var msg = document.getElementById('trial-msg'), send = document.getElementById('trial-send');

  function chips(alan, liste) {
    alan.innerHTML = liste.map(function (o) {
      return '<button type="button" data-v="' + o.v + '"' + (o.kapali ? ' disabled' : '') + '>' + o.t + (o.alt ? '<small>' + o.alt + '</small>' : '') + '</button>';
    }).join('');
  }
  function isaretle(alan, v) {
    alan.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', b.dataset.v === v); });
  }
  function gunleriKur() {
    var grup = GRUP[secim.ders];
    chips(gunAlan, GUNLER.slice(0, grup ? 5 : 6).map(function (g) {
      var var_ = !grup || program.some(function (d) { return d.gun === g && d.tur === secim.ders; });
      return { v: g, t: g, kapali: !var_ };
    }));
    steps[1].disabled = false;
  }
  function saatleriKur() {
    if (GRUP[secim.ders]) {
      chips(saatAlan, program.filter(function (d) { return d.gun === secim.gun && d.tur === secim.ders; })
        .map(function (d) { return { v: d.saat, t: d.saat, alt: d.not || '' }; }));
    } else {
      chips(saatAlan, ZAMAN.map(function (z) { return { v: z[0], t: z[0], alt: z[1] }; }));
    }
    steps[2].disabled = false;
  }
  function guncelle() {
    var tamam = secim.ders && secim.gun && secim.saat;
    var metin = 'Merhaba, ücretsiz deneme dersi almak istiyorum.';
    if (tamam) {
      var zaman = GRUP[secim.ders] ? secim.gun + ' ' + secim.saat : secim.gun + ' ' + secim.saat.toLocaleLowerCase('tr') + ' saatleri';
      metin = 'Merhaba, ' + AD[secim.ders] + ' için ücretsiz deneme dersi almak istiyorum. Bana uygun zaman: ' + zaman + '.';
      msg.innerHTML = '<span>Hazırlanan mesaj</span>“' + metin + '”';
    } else {
      msg.textContent = 'Ders, gün ve saat seç; mesajın burada hazırlansın.';
    }
    send.href = 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(metin);
    send.classList.toggle('is-disabled', !tamam);
    send.setAttribute('aria-disabled', !tamam);
  }
  function sec(alan, v) {
    secim[alan] = v;
    if (alan === 'ders') { secim.gun = secim.saat = null; isaretle(box.querySelector('[data-alan="ders"]'), v); gunleriKur(); saatAlan.innerHTML = ''; steps[2].disabled = true; }
    if (alan === 'gun') { secim.saat = null; isaretle(gunAlan, v); saatleriKur(); }
    if (alan === 'saat') isaretle(saatAlan, v);
    guncelle();
  }
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.closest('.trial-close')) return kapat();
    var b = e.target.closest('.trial-chips button');
    if (b && !b.disabled) sec(b.parentElement.dataset.alan, b.dataset.v);
  });
  send.addEventListener('click', function (e) { if (send.classList.contains('is-disabled')) e.preventDefault(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) kapat(); });

  function ac(ders) {
    sonOdak = document.activeElement;
    secim = {}; isaretle(box.querySelector('[data-alan="ders"]'), null);
    gunAlan.innerHTML = saatAlan.innerHTML = ''; steps[1].disabled = steps[2].disabled = true;
    if (ders && AD[ders]) sec('ders', ders); else guncelle();
    box.hidden = false; document.body.classList.add('trial-open');
    box.querySelector('.trial-close').focus();
  }
  function kapat() {
    box.hidden = true; document.body.classList.remove('trial-open');
    if (sonOdak) sonOdak.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-deneme]');
    if (!t) return;
    e.preventDefault(); ac(t.dataset.deneme);
  });
  return { ac: ac };
})();
