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
