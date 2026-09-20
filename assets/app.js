/* Dr. Maged Ragab — runtime behaviour.
   Everything else on the site is static HTML; this file only handles the
   things that genuinely need a browser: the mobile menu, the services jump
   list, and the booking flow. */
(function () {
  'use strict';
  var LANG = (window.SITE && window.SITE.lang) || document.documentElement.lang || 'ar';
  var PAGE = (window.SITE && window.SITE.page) || '';
  var AR = LANG === 'ar';
  var CLINICS = [{"id": "kfs", "ar": "عيادة كفر الشيخ", "en": "Kafr El Sheikh Clinic", "areaAr": "كفر الشيخ، مصر", "areaEn": "Kafr El Sheikh, Egypt", "daysAr": "الأحد · الثلاثاء · السبت", "daysEn": "Sun · Tue · Sat", "hoursAr": "3:00 – 9:00 مساءً", "hoursEn": "3:00 – 9:00 PM", "wd": [0, 2, 6]}, {"id": "mvd", "ar": "عيادة ميفيدا", "en": "Mivida Clinic", "areaAr": "ميفيدا، القاهرة الجديدة", "areaEn": "Mivida, New Cairo", "daysAr": "الأربعاء · الخميس", "daysEn": "Wed · Thu", "hoursAr": "3:00 – 9:00 مساءً", "hoursEn": "3:00 – 9:00 PM", "wd": [3, 4]}];

  var DOW = AR ? ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
               : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MON = AR ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
               : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var NOON = ['3:00','3:15','3:30','3:45','4:00','4:15','4:30','4:45','5:00','5:15','5:30','5:45'];
  var EVE  = ['6:00','6:15','6:30','6:45','7:00','7:15','7:30','7:45','8:00','8:15','8:30','8:45'];

  var T = AR ? {
    notSet:'لم يُحدَّد بعد', free:' موعد متاح', pm:' م',
    errName:'من فضلك اكتب اسمك الكامل.',
    errPhone:'الرقم يجب أن يبدأ بـ 01 ويتكوّن من 11 رقمًا.',
    errOk:'من فضلك أكّد صحة الرقم.'
  } : {
    notSet:'Not selected yet', free:' times available', pm:' PM',
    errName:'Please enter your full name.',
    errPhone:'The number must start with 01 and be 11 digits.',
    errOk:'Please confirm the number is correct.'
  };

  function el(id) { return document.getElementById(id); }
  function svgTick() {
    return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
           ' stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           '<path d="M20 6 9 17l-5-5"/></svg>';
  }
  function icon(d, w) {
    return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 24 24" fill="none"' +
           ' stroke="currentColor" stroke-width="1.9" stroke-linecap="round"' +
           ' stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  var I_CAL = '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>';
  var I_CLK = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>';

  /* ---------------------------------------------------------- mobile menu */
  var burger = el('burger'), nav = el('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ------------------------------------------------------- services jumps */
  var svcNav = el('svcNav');
  if (svcNav) {
    function mark(id) {
      var b = svcNav.querySelectorAll('button');
      for (var i = 0; i < b.length; i++) {
        b[i].setAttribute('aria-pressed', b[i].getAttribute('data-jump') === id ? 'true' : 'false');
      }
    }
    svcNav.addEventListener('click', function (ev) {
      var t = ev.target.closest('button[data-jump]');
      if (!t) return;
      var id = t.getAttribute('data-jump');
      mark(id);
      var g = el('svc-' + id);
      if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (location.hash.indexOf('#svc-') === 0) mark(location.hash.slice(5));
  }

  /* -------------------------------------------------------------- booking */
  if (PAGE !== 'booking' || !el('clinicPick')) return;

  var qs = new URLSearchParams(location.search);
  var wanted = qs.get('clinic');
  var bk = {
    clinic: CLINICS.some(function (c) { return c.id === wanted; }) ? wanted : CLINICS[0].id,
    day: 0, time: '', step: 1, dates: []
  };

  function clinic() {
    return CLINICS.filter(function (c) { return c.id === bk.clinic; })[0];
  }
  function upcoming(count) {
    var c = clinic(), out = [], d = new Date(), guard = 0;
    d.setHours(0, 0, 0, 0);
    while (out.length < count && guard < 120) {
      if (c.wd.indexOf(d.getDay()) !== -1) out.push(new Date(d));
      d.setDate(d.getDate() + 1); guard++;
    }
    return out;
  }
  /* DEMO ONLY — replace with a real availability query. See README §6. */
  function taken(dateObj, idx) {
    var seed = dateObj.getDate() * 31 + dateObj.getMonth() * 7 + bk.clinic.charCodeAt(0);
    return ((seed + idx * 13) % 7) === 0;
  }
  function fmtDay(d) { return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }
  function fmtTime(t) { return t + T.pm; }

  function render() {
    bk.dates = upcoming(5);
    if (bk.day >= bk.dates.length) bk.day = 0;

    el('clinicPick').innerHTML = CLINICS.map(function (c) {
      var on = c.id === bk.clinic;
      return '<button type="button" class="pick" data-pick-clinic="' + c.id + '" aria-pressed="' + on + '">' +
        '<span class="pick-hd"><span><b>' + (AR ? c.ar : c.en) + '</b>' +
        '<span>' + (AR ? c.areaAr : c.areaEn) + '</span></span>' +
        '<span class="tick">' + svgTick() + '</span></span>' +
        '<span class="pick-meta">' +
        '<div>' + icon(I_CAL, 15) + '<span>' + (AR ? c.daysAr : c.daysEn) + '</span></div>' +
        '<div>' + icon(I_CLK, 15) + '<span>' + (AR ? c.hoursAr : c.hoursEn) + '</span></div>' +
        '</span></button>';
    }).join('');

    el('dayPick').innerHTML = bk.dates.map(function (d, i) {
      return '<button type="button" class="day" data-pick-day="' + i + '" aria-pressed="' + (i === bk.day) + '">' +
        '<small>' + DOW[d.getDay()] + '</small><b>' + d.getDate() + '</b>' +
        '<small>' + MON[d.getMonth()] + '</small></button>';
    }).join('');

    var date = bk.dates[bk.day], free = 0;
    function slots(list, offset) {
      return list.map(function (t, i) {
        var isTaken = taken(date, i + offset);
        if (!isTaken) free++;
        return '<button type="button" class="chip-t" data-pick-time="' + t + '"' +
          (isTaken ? ' disabled' : '') + ' aria-pressed="' + (bk.time === t) + '">' +
          fmtTime(t) + '</button>';
      }).join('');
    }
    el('slotsNoon').innerHTML = slots(NOON, 0);
    el('slotsEve').innerHTML = slots(EVE, 12);
    el('freeCount').textContent = free + T.free;

    var c = clinic();
    el('sumClinic').textContent = AR ? c.ar : c.en;
    el('sumDay').textContent = fmtDay(date);
    var tEl = el('sumTime');
    if (bk.time) { tEl.textContent = fmtTime(bk.time); tEl.classList.remove('na'); }
    else { tEl.textContent = T.notSet; tEl.classList.add('na'); }
    el('toStep2').disabled = !bk.time;
  }

  function setStep(n) {
    bk.step = n;
    el('step1').hidden = n !== 1;
    el('step2').hidden = n !== 2;
    el('bkShell').hidden = n === 3;
    el('step3').hidden = n !== 3;
    var r = document.querySelectorAll('.rail-s');
    for (var i = 0; i < r.length; i++) {
      var s = +r[i].getAttribute('data-step');
      r[i].classList.toggle('on', s === n);
      r[i].classList.toggle('done', s < n);
    }
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (ev) {
    var t;
    t = ev.target.closest('[data-pick-clinic]');
    if (t) { bk.clinic = t.getAttribute('data-pick-clinic'); bk.day = 0; bk.time = ''; render(); return; }
    t = ev.target.closest('[data-pick-day]');
    if (t) { bk.day = +t.getAttribute('data-pick-day'); bk.time = ''; render(); return; }
    t = ev.target.closest('[data-pick-time]');
    if (t && !t.disabled) { bk.time = t.getAttribute('data-pick-time'); render(); return; }
  });

  el('toStep2').addEventListener('click', function () { if (bk.time) setStep(2); });
  el('backTo1').addEventListener('click', function () { setStep(1); });
  el('bkPhone').addEventListener('input', function () {
    this.value = this.value.replace(/[^\d]/g, '').slice(0, 11);
  });

  el('step2').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = el('bkName'), phone = el('bkPhone'), ok = el('bkOk'), bad = null;
    function mark(input, errEl, msg) {
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        errEl.textContent = msg; errEl.hidden = false;
        if (!bad) bad = input;
      } else { input.removeAttribute('aria-invalid'); errEl.hidden = true; }
    }
    mark(name, el('errName'), name.value.trim().length < 3 ? T.errName : '');
    mark(phone, el('errPhone'), /^01\d{9}$/.test(phone.value.trim()) ? '' : T.errPhone);
    if (!ok.checked) { el('errOk').textContent = T.errOk; el('errOk').hidden = false; if (!bad) bad = ok; }
    else { el('errOk').hidden = true; }
    if (bad) { bad.focus(); return; }

    /* TODO: POST to the booking API here, then show step 3 on success.
       See README §6 — nothing is sent anywhere yet. */
    var c = clinic(), d = bk.dates[bk.day];
    el('okName').textContent = name.value.trim();
    el('okPhone').textContent = phone.value.trim();
    el('okClinic').textContent = AR ? c.ar : c.en;
    el('okWhen').textContent = fmtDay(d) + ' — ' + fmtTime(bk.time);
    el('okRef').textContent = 'MR-' + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' +
      String(Math.floor(Math.random() * 9000) + 1000);
    setStep(3);
  });

  el('againBtn').addEventListener('click', function () {
    bk.time = ''; el('step2').reset();
    el('errName').hidden = true; el('errPhone').hidden = true; el('errOk').hidden = true;
    el('bkName').removeAttribute('aria-invalid');
    el('bkPhone').removeAttribute('aria-invalid');
    render(); setStep(1);
  });

  render(); setStep(1);
})();
