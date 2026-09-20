/* Dr. Maged Ragab — runtime behaviour.
   Everything else on the site is static HTML; this file only handles the
   things that genuinely need a browser: the mobile menu, the services jump
   list, and the booking flow. */
(function () {
  'use strict';
  var LANG = (window.SITE && window.SITE.lang) || document.documentElement.lang || 'ar';
  var PAGE = (window.SITE && window.SITE.page) || '';
  var AR = LANG === 'ar';
  var CLINICS = [{"id": "kfs", "ar": "عيادة كفر الشيخ", "en": "Kafr El Sheikh Clinic", "areaAr": "كفر الشيخ، مصر", "areaEn": "Kafr El Sheikh, Egypt", "daysAr": "السبت · الأحد · الإثنين · الثلاثاء", "daysEn": "Sat · Sun · Mon · Tue", "hoursAr": "3:00 – 9:00 مساءً", "hoursEn": "3:00 – 9:00 PM", "wd": [0, 1, 2, 6]}, {"id": "mvd", "ar": "عيادة ميفيدا", "en": "Mivida Clinic", "areaAr": "ميفيدا، القاهرة الجديدة", "areaEn": "Mivida, New Cairo", "daysAr": "الأربعاء · الخميس", "daysEn": "Wed · Thu", "hoursAr": "3:00 – 9:00 مساءً", "hoursEn": "3:00 – 9:00 PM", "wd": [3, 4]}];

  var DOW = AR ? ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
               : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MON = AR ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
               : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var T = AR ? {
    notSet:'لم يُحدَّد بعد', free:' موعد متاح', pm:' م',
    errName:'من فضلك اكتب اسمك الكامل.',
    errPhone:'الرقم يجب أن يبدأ بـ 01 ويتكوّن من 11 رقمًا.',
    errOk:'من فضلك أكّد صحة الرقم.',
    sending:'جارٍ الحجز…',
    errNet:'تعذّر الاتصال. من فضلك حاول مرة أخرى أو راسلنا على واتساب.',
    errTaken:'هذا الموعد حُجز للتو. اخترنا لك خطوة للخلف — من فضلك اختر موعدًا آخر.',
    loading:'جارٍ تحميل المواعيد المتاحة…',
    noSlots:'لا توجد مواعيد متاحة لهذه العيادة في الوقت الحالي. من فضلك راسلنا على واتساب أو اتصل بنا وسنحجز لك.',
    errAvail:'تعذّر تحميل المواعيد. من فضلك راسلنا على واتساب أو اتصل بنا وسنحجز لك.'
  } : {
    notSet:'Not selected yet', free:' times available', pm:' PM',
    errName:'Please enter your full name.',
    errPhone:'The number must start with 01 and be 11 digits.',
    errOk:'Please confirm the number is correct.',
    sending:'Booking…',
    errNet:'We could not reach the clinic. Please try again, or message us on WhatsApp.',
    errTaken:'That time was just taken. We have sent you back a step — please pick another.',
    loading:'Loading available times…',
    noSlots:'There are no times open at this clinic right now. Message us on WhatsApp or call, and we will book you in.',
    errAvail:'We could not load the available times. Message us on WhatsApp or call, and we will book you in.'
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

  /* Which days and times exist is the database's business, not this file's.
     /api/availability reads the same appointment_slots table the admin
     platform writes to, so a slot the receptionist closes disappears here
     too. The only thing hardcoded is the public window: the clinic works
     11:00–23:00, the website offers 15:00–20:45. */
  var GRID = [];
  for (var gh = 15; gh < 21; gh++) {
    for (var gi = 0; gi < 4; gi++) {
      GRID.push(String(gh).padStart(2, '0') + ':' + String(gi * 15).padStart(2, '0'));
    }
  }
  var HORIZON = 60;     // days ahead to ask about
  var SHOW_DAYS = 5;    // day chips offered at once

  var AVAIL = {};       // "2026-09-22" → ["15:00", "15:15", …]
  var STATE = 'loading';

  var qs = new URLSearchParams(location.search);
  var wanted = qs.get('clinic');
  var bk = {
    clinic: CLINICS.some(function (c) { return c.id === wanted; }) ? wanted : CLINICS[0].id,
    day: 0, time: '', step: 1, dates: []
  };

  function clinic() {
    return CLINICS.filter(function (c) { return c.id === bk.clinic; })[0];
  }
  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function parseISO(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function openDays() {
    return Object.keys(AVAIL)
      .filter(function (d) { return AVAIL[d] && AVAIL[d].length; })
      .sort()
      .slice(0, SHOW_DAYS)
      .map(parseISO);
  }
  function isOpen(dateObj, slot) {
    var list = AVAIL[iso(dateObj)];
    return !!list && list.indexOf(slot) !== -1;
  }
  function fmtDay(d) { return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }
  function fmtTime(t) {
    var p = t.split(':'), h = +p[0];
    return (h > 12 ? h - 12 : h) + ':' + p[1] + T.pm;
  }

  function loadAvailability() {
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var end = new Date(start); end.setDate(end.getDate() + HORIZON);
    var asked = bk.clinic;
    STATE = 'loading';
    fetch('/api/availability?clinic=' + encodeURIComponent(bk.clinic) +
          '&from=' + iso(start) + '&to=' + iso(end),
          { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (asked !== bk.clinic) return;   // patient switched clinic mid-flight
        if (!j || !j.ok) { AVAIL = {}; STATE = 'error'; render(); return; }
        AVAIL = j.days || {};
        STATE = Object.keys(AVAIL).length ? 'ok' : 'empty';
        if (bk.time && bk.dates[bk.day] && !isOpen(bk.dates[bk.day], bk.time)) bk.time = '';
        render();
      })
      .catch(function () {
        if (asked !== bk.clinic) return;
        AVAIL = {}; STATE = 'error'; render();
      });
  }

  function render() {
    bk.dates = openDays();
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

    var msg = el('slotsMsg'), wrap = el('slotsWrap');
    if (!bk.dates.length) {
      // Nothing to offer. Say so plainly and point at a human, rather than
      // showing an empty grid the patient will keep poking at.
      wrap.hidden = true;
      msg.hidden = false;
      msg.textContent = STATE === 'loading' ? T.loading
                      : STATE === 'error' ? T.errAvail : T.noSlots;
      el('freeCount').textContent = '';
      el('sumClinic').textContent = AR ? clinic().ar : clinic().en;
      el('sumDay').textContent = T.notSet;
      el('sumTime').textContent = T.notSet;
      el('sumTime').classList.add('na');
      el('toStep2').disabled = true;
      return;
    }
    wrap.hidden = false;
    msg.hidden = true;

    var date = bk.dates[bk.day], free = 0;
    function slots(list) {
      return list.map(function (t) {
        var open = isOpen(date, t);
        if (open) free++;
        return '<button type="button" class="chip-t" data-pick-time="' + t + '"' +
          (open ? '' : ' disabled') + ' aria-pressed="' + (bk.time === t) + '">' +
          fmtTime(t) + '</button>';
      }).join('');
    }
    el('slotsNoon').innerHTML = slots(GRID.filter(function (t) { return +t.slice(0, 2) < 18; }));
    el('slotsEve').innerHTML  = slots(GRID.filter(function (t) { return +t.slice(0, 2) >= 18; }));
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
    if (t) {
      bk.clinic = t.getAttribute('data-pick-clinic');
      bk.day = 0; bk.time = ''; AVAIL = {};
      render(); loadAvailability(); return;
    }
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

    var c = clinic(), d = bk.dates[bk.day];
    var btn = el('bkSubmit'), errBox = el('errSubmit');
    var label = btn.textContent;

    function done() {
      btn.removeAttribute('aria-busy'); btn.disabled = false; btn.textContent = label;
    }
    function fail(msg) {
      done();
      errBox.textContent = msg; errBox.hidden = false;
      errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    errBox.hidden = true;
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    btn.textContent = T.sending;

    fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic: bk.clinic,
        date: iso(d),
        time: bk.time,
        name: name.value.trim(),
        phone: phone.value.trim(),
        notes: el('bkNotes').value.trim(),
        locale: LANG,
        company: el('bkCompany') ? el('bkCompany').value : ''
      })
    }).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, body: j }; });
    }).then(function (out) {
      if (out.status === 409 || (out.body && out.body.code === 'slot_taken')) {
        // Someone reached it first. Drop the slot, re-read availability,
        // and put the patient back on step 1 with the message showing.
        bk.time = '';
        loadAvailability();
        fail(T.errTaken);
        render(); setStep(1);
        return;
      }
      if (!out.body || !out.body.ok) {
        var m = out.body && out.body.message;
        return fail(m ? (AR ? m.ar : m.en) : T.errNet);
      }
      done();
      el('okName').textContent = name.value.trim();
      el('okPhone').textContent = phone.value.trim();
      el('okClinic').textContent = AR ? c.ar : c.en;
      el('okWhen').textContent = fmtDay(d) + ' — ' + fmtTime(bk.time);
      el('okRef').textContent = out.body.ref;
      setStep(3);
    }).catch(function () { fail(T.errNet); });
  });

  el('againBtn').addEventListener('click', function () {
    bk.time = ''; el('step2').reset();
    el('errName').hidden = true; el('errPhone').hidden = true;
    el('errOk').hidden = true; el('errSubmit').hidden = true;
    el('bkName').removeAttribute('aria-invalid');
    el('bkPhone').removeAttribute('aria-invalid');
    loadAvailability();
    render(); setStep(1);
  });

  render(); setStep(1); loadAvailability();
})();
