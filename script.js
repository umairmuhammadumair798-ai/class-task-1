(function () {
  var cur = document.getElementById('current');
  var hist = document.getElementById('history');
  var symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  var value = '0', prev = null, op = null, fresh = false;

  function fmt(s) {
    if (s === 'Error') return s;
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function render() {
    cur.textContent = fmt(value);
    hist.textContent = op ? fmt(String(prev)) + ' ' + symbols[op] : '';
  }
  function compute(a, b, o) {
    a = parseFloat(a); b = parseFloat(b);
    var r;
    if (o === '+') r = a + b;
    else if (o === '-') r = a - b;
    else if (o === '*') r = a * b;
    else if (o === '/') { if (b === 0) return 'Error'; r = a / b; }
    r = parseFloat(r.toPrecision(12));
    return String(r);
  }
  function num(d) {
    if (value === 'Error') reset();
    if (fresh) { value = '0'; fresh = false; }
    value = value === '0' ? d : value + d;
    if (value.replace(/[-.]/g, '').length > 15) value = value.slice(0, -1);
    render();
  }
  function dot() {
    if (value === 'Error') reset();
    if (fresh) { value = '0'; fresh = false; }
    if (value.indexOf('.') === -1) value += '.';
    render();
  }
  function setOp(o) {
    if (value === 'Error') return;
    if (op && !fresh) {
      value = compute(prev, value, op);
      if (value === 'Error') { op = null; prev = null; render(); return; }
    }
    prev = value; op = o; fresh = true; render();
  }
  function equals() {
    if (!op || value === 'Error') return;
    var shown = fmt(String(prev)) + ' ' + symbols[op] + ' ' + fmt(value) + ' =';
    value = compute(prev, value, op);
    op = null; prev = null; fresh = true;
    cur.textContent = fmt(value); hist.textContent = shown;
  }
  function percent() {
    if (value === 'Error') return;
    value = String(parseFloat((parseFloat(value) / 100).toPrecision(12)));
    render();
  }
  function back() {
    if (value === 'Error' || fresh) return;
    value = value.length > 1 ? value.slice(0, -1) : '0';
    if (value === '-') value = '0';
    render();
  }
  function reset() { value = '0'; prev = null; op = null; fresh = false; render(); }

  document.querySelector('.keys').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.num !== undefined) num(b.dataset.num);
    else if (b.dataset.op) setOp(b.dataset.op);
    else {
      var a = b.dataset.action;
      if (a === 'clear') reset();
      else if (a === 'back') back();
      else if (a === 'dot') dot();
      else if (a === 'equals') equals();
      else if (a === 'percent') percent();
    }
  });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (/^[0-9]$/.test(k)) num(k);
    else if (k === '.') dot();
    else if ('+-*/'.indexOf(k) !== -1) { e.preventDefault(); setOp(k); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
    else if (k === 'Backspace') back();
    else if (k === 'Escape' || k === 'Delete') reset();
    else if (k === '%') percent();
  });
  render();
})();
