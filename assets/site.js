/* ============================================================
   마케터박프로의 온라인광고 탐험기록 — 공통 스크립트

   ▼ 설정: 아래 SITE 값만 바꾸면 사이트 전체에 반영됩니다.
   ============================================================ */

var SITE = {
  // 문의를 받을 이메일
  email: 'enter218@gmail.com',

  // 폼 전송 방식
  //  'mailto'    → 별도 가입 없이 즉시 작동. 메일 앱이 열립니다. (기본값, 무료)
  //  'formspree' → formspree.io 무료 가입 후 받은 주소를 formEndpoint에 넣으세요.
  formMode: 'mailto',
  formEndpoint: '' // 예: 'https://formspree.io/f/xxxxxxxx'
};

/* ---------- 모바일 내비게이션 ---------- */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') nav.classList.remove('open');
  });
})();

/* ---------- 스크롤 등장 효과 ---------- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  Array.prototype.forEach.call(items, function (el, i) {
    el.style.transitionDelay = Math.min(i * 60, 300) + 'ms';
    io.observe(el);
  });
})();

/* ---------- 진단 신청 폼 ---------- */
(function () {
  var form = document.querySelector('#diagnosis-form');
  if (!form) return;

  var status = document.querySelector('#form-status');

  function say(msg, bad) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = bad ? '#96421F' : '#3A3A30';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = new FormData(form);
    function get(k) { return (data.get(k) || '').toString().trim(); }

    if (!get('name') || !get('contact')) {
      say('업체명(담당자)과 연락처는 꼭 입력해 주세요.', true);
      return;
    }

    var lines = [
      '■ 업체 / 담당자: ' + get('name'),
      '■ 연락처: ' + get('contact'),
      '■ 업종: ' + (get('industry') || '-'),
      '■ 월 광고 예산: ' + (get('budget') || '-'),
      '■ 현재 집행 채널: ' + (get('channels') || '-'),
      '',
      '■ 가장 답답한 점:',
      get('message') || '-',
      '',
      '— 온라인광고 탐험기록 진단 신청'
    ].join('\n');

    if (SITE.formMode === 'formspree' && SITE.formEndpoint) {
      say('보내는 중…');
      fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      }).then(function (r) {
        if (!r.ok) throw new Error('fail');
        form.reset();
        say('신청이 접수되었습니다. 영업일 기준 2일 안에 회신드리겠습니다.');
      }).catch(function () {
        say('전송에 실패했습니다. ' + SITE.email + ' 로 직접 보내주셔도 됩니다.', true);
      });
      return;
    }

    window.location.href =
      'mailto:' + SITE.email +
      '?subject=' + encodeURIComponent('[광고 진단 신청] ' + get('name')) +
      '&body=' + encodeURIComponent(lines);

    say('메일 앱이 열립니다. 내용 확인 후 전송해 주세요. 열리지 않으면 ' + SITE.email + ' 로 보내주시면 됩니다.');
  });
})();

/* ---------- 연도 자동 갱신 ---------- */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
