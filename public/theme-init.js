// Restores the last used theme before first paint, so there is no flash of the default look.
// Stored values are untrusted: only plain custom properties with colour, number, length or font values are applied.
(function () {
  try {
    var raw = localStorage.getItem('devduo.themevars');
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (!saved || typeof saved.vars !== 'object' || saved.vars === null) return;
    var NAME = /^--[a-z0-9-]+$/i;
    var VALUE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[\w\s,'"%.-]{1,80})$/i;
    var root = document.documentElement;
    for (var k in saved.vars) {
      if (!Object.prototype.hasOwnProperty.call(saved.vars, k)) continue;
      var v = saved.vars[k];
      if (typeof v === 'string' && NAME.test(k) && VALUE.test(v) && !/url\(|[;{}]/i.test(v)) root.style.setProperty(k, v);
    }
    if (saved.mode === 'light' || saved.mode === 'dark') root.setAttribute('data-theme', saved.mode);
  } catch (e) {}
})();
