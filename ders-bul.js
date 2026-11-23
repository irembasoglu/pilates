// "Sana uygun dersi bul" testi: dört cevaba göre bir ana öneri ve bir ek öneri seçer
(function () {
  var quiz = document.getElementById('quiz');
  if (!quiz) return;
  var sorular = quiz.querySelectorAll('.quiz-q');
  var sonuc = document.getElementById('quiz-result');
  var bar = document.getElementById('quiz-bar'), sayac = document.getElementById('quiz-count'), geri = document.getElementById('quiz-back');
  var cevap = {}, adim = 0;

  var H = {};
  (window.HIZMETLER || []).forEach(function (h) { H[h.id] = h; });
  // Zumba hizmet listesinde yok: programdaki yeni ders olarak ekleniyor
  H.zumba = { id: 'zumba', sayfa_baslik: 'Zumba', foto: null, kisa: 'Müzik eşliğinde, enerjisi yüksek bir grup dersi.', saatler: [['Çarşamba', '20:00']] };
  // Test kimliği → deneme penceresindeki ders kimliği
  var DENEME = { pilates: 'pilates', yoga: 'yoga', zumba: 'zumba', 'hamile-pilatesi': 'hamile', 'ozel-ders': 'ozel', 'duet-ders': 'duet' };

  function karar() {
    var hedef = cevap.hedef, ana, neden, ek = null, ekNeden = '';
    if (cevap.durum === 'hamile') {
      ana = 'hamile-pilatesi';
      neden = 'Hamilelik dönemine uygun, güvenli hareketlerle bedenini güçlü ve rahat tutarsın. Başlamadan önce doktorundan onay almanı öneririz.';
    } else if (cevap.sekil === 'arkadas') {
      ana = 'duet-ders';
      neden = 'Sevdiğin biriyle birlikte, iki kişiye özel derste hem yakın takip görür hem de birbirinizi motive edersiniz.';
    } else if (cevap.sekil === 'birebir' || cevap.durum === 'agri' || (hedef === 'pilates' && cevap.deneyim === 'yeni')) {
      ana = 'ozel-ders';
      neden = cevap.durum === 'agri'
        ? 'Ağrın ya da sakatlığın olduğu için eğitmenin sadece seninle çalışması en güvenli başlangıç. Program tamamen sana göre uyarlanır.'
        : (cevap.sekil === 'birebir'
          ? 'Eğitmen sadece seninle çalışır, program tamamen senin hedefine göre hazırlanır.'
          : 'Aletli pilatese hiç başlamadıysan birkaç birebir dersle hareketleri doğru öğrenip sonra gruba geçmek en kolay yol.');
      if (hedef === 'pilates' || hedef === 'yoga') { ek = hedef; ekNeden = 'Hazır hissettiğinde grup derslerine geçebilirsin.'; }
    } else if (hedef === 'diyetisyen') {
      ana = 'diyetisyen';
      neden = 'Hedefine ve yaşam tarzına uygun bir beslenme planıyla başlayalım; egzersizle birleştiğinde sonuç çok daha hızlı gelir.';
      ek = 'pilates'; ekNeden = 'Beslenme planını aletli pilatesle desteklersen sonuçları daha hızlı görürsün.';
    } else {
      ana = hedef;
      neden = {
        pilates: 'Aletli pilates core kaslarını güçlendirir, duruşunu düzeltir ve bel-boyun ağrılarını azaltmaya yardımcı olur.',
        yoga: cevap.deneyim === 'yeni'
          ? 'Salı 19:00 başlangıç grubu tam sana göre: nefes, esneklik ve denge çalışmalarıyla güvenle başlarsın.'
          : 'Nefes, denge ve esneklik çalışmalarıyla bedenini güçlendirirken zihnini de dinlendirirsin.',
        zumba: 'Müzik eşliğinde, enerjisi yüksek bir ders. Spor yaptığını unutup eğlenirsin.'
      }[hedef];
      if (hedef !== 'diyetisyen') { ek = 'diyetisyen'; ekNeden = 'Egzersizini doğru beslenmeyle desteklemek istersen diyetisyenimiz de burada.'; }
    }
    return { ana: H[ana], neden: neden, ek: ek && H[ek], ekNeden: ekNeden };
  }

  function sonucuGoster() {
    var r = karar(), h = r.ana;
    var saat = (h.saatler || []).map(function (s) { return '<li><b>' + s[0] + '</b> ' + s[1] + '</li>'; }).join('');
    var foto = h.foto
      ? '<div class="qr-photo"><img src="' + h.foto + '" alt=""' + (h.foto_konum ? ' style="object-position:' + h.foto_konum + '"' : '') + '></div>'
      : '<div class="qr-photo qr-photo-empty"><span>Zumba</span></div>';
    var detay = h.id === 'zumba' ? 'program.html' : 'hizmet-' + h.id + '.html';
    sonuc.innerHTML =
      '<p class="qr-kicker">Sana önerimiz</p>' +
      '<div class="qr-main">' + foto +
        '<div class="qr-text"><h2>' + h.sayfa_baslik + '</h2><p>' + r.neden + '</p>' +
        (saat ? '<ul class="qr-times">' + saat + '</ul>' : '') +
        '<div class="qr-actions"><button type="button" class="btn btn-lg" data-deneme="' + DENEME[h.id] + '">Ücretsiz deneme dersi al</button>' +
        '<a href="' + detay + '" class="btn-soft">' + (h.id === 'zumba' ? 'Ders programı' : 'Detayları gör') + '</a></div></div>' +
      '</div>' +
      (r.ek ? '<a class="qr-extra" href="hizmet-' + r.ek.id + '.html"><span><small>Bunu da sevebilirsin</small><b>' + r.ek.sayfa_baslik + '</b>' + r.ekNeden + '</span><i aria-hidden="true">→</i></a>' : '') +
      '<button type="button" class="quiz-restart" id="quiz-restart">Testi baştan çöz</button>';
    document.getElementById('quiz-restart').onclick = function () { cevap = {}; goster(0); };
  }

  function goster(i) {
    adim = i;
    sorular.forEach(function (q, k) { q.hidden = k !== i; });
    var bitti = i >= sorular.length;
    sonuc.hidden = !bitti;
    bar.style.width = (Math.min(i, sorular.length) / sorular.length * 100) + '%';
    sayac.textContent = bitti ? '' : 'Soru ' + (i + 1) + ' / ' + sorular.length;
    sayac.hidden = bitti;
    geri.hidden = i === 0 || bitti;
    if (bitti) sonucuGoster();
    sorular.forEach(function (q) {
      q.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', cevap[q.dataset.q] === b.dataset.v); });
    });
    var hedef = bitti ? sonuc.querySelector('h2') : sorular[i].querySelector('h2');
    if (hedef && i > 0) { hedef.setAttribute('tabindex', '-1'); hedef.focus({ preventScroll: true }); }
  }

  sorular.forEach(function (q, k) {
    q.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-opts button');
      if (!b) return;
      cevap[q.dataset.q] = b.dataset.v;
      b.classList.add('on');
      setTimeout(function () { goster(k + 1); }, 180);
    });
  });
  geri.onclick = function () { goster(Math.max(0, adim - 1)); };
  goster(0);
})();
