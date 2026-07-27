/* ============================================================
   마케터박프로의 온라인광고 탐험기록 — 공통 스크립트

   ▼ 설정: 아래 SITE 값만 바꾸면 사이트 전체에 반영됩니다.
   ============================================================ */

var SITE = {
  // 문의를 받을 이메일 (전송 실패 시 안내용으로 표시됩니다)
  email: 'enter218@gmail.com',

  // ▼▼▼ 여기에 구글 앱스크립트 배포 주소를 붙여넣으세요 ▼▼▼
  // 형태: https://script.google.com/macros/s/AKfycb.....(긴 문자열)...../exec
  // 비워두면 자동으로 메일 앱이 열리는 방식으로 작동합니다.
  sheetEndpoint: ''
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
  var btn = form.querySelector('button[type="submit"]');
  var btnText = btn ? btn.innerHTML : '';

  function say(msg, kind) {
    if (!status) return;
    status.innerHTML = msg;
    status.style.color = kind === 'bad' ? '#96421F'
                       : kind === 'ok'  ? '#2F6B3A'
                       : '#3A3A30';
  }

  function lock(on) {
    if (!btn) return;
    btn.disabled = on;
    btn.style.opacity = on ? '.55' : '';
    btn.style.cursor = on ? 'default' : '';
    btn.innerHTML = on ? '보내는 중…' : btnText;
  }

  function mailtoFallback(get) {
    var body = [
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

    window.location.href =
      'mailto:' + SITE.email +
      '?subject=' + encodeURIComponent('[광고 진단 신청] ' + get('name')) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = new FormData(form);
    function get(k) { return (data.get(k) || '').toString().trim(); }

    // 필수값
    if (!get('name') || !get('contact')) {
      say('업체명(담당자)과 연락처는 꼭 입력해 주세요.', 'bad');
      return;
    }
    // 개인정보 동의
    var agree = form.querySelector('.consent input[type="checkbox"]');
    if (agree && !agree.checked) {
      say('개인정보 수집·이용에 동의해 주셔야 신청이 접수됩니다.', 'bad');
      return;
    }
    // 연락처 형식 (이메일 또는 숫자 9자리 이상)
    var c = get('contact');
    var okContact = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c) ||
                    (c.replace(/[^0-9]/g, '').length >= 9);
    if (!okContact) {
      say('연락처를 이메일 또는 휴대폰 번호 형태로 입력해 주세요.', 'bad');
      return;
    }

    // 엔드포인트 미설정 시 메일 앱으로
    if (!SITE.sheetEndpoint) {
      mailtoFallback(get);
      say('메일 앱이 열립니다. 내용 확인 후 전송해 주세요.');
      return;
    }

    lock(true);
    say('보내는 중…');

    var params = new URLSearchParams();
    ['name','contact','industry','budget','channels','message'].forEach(function (k) {
      params.append(k, get(k));
    });
    params.append('page', location.href);
    params.append('ref', document.referrer || '');

    fetch(SITE.sheetEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: params.toString()
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (res && res.ok === false) throw new Error(res.error || 'fail');
        form.reset();
        say('접수되었습니다. 잠시만 기다려 주세요…', 'ok');
        // 완료 페이지로 이동 (전환 측정 지점)
        location.href = 'thanks.html?i=' + encodeURIComponent(get('industry'))
                      + '&b=' + encodeURIComponent(get('budget'));
      })
      .catch(function () {
        lock(false);
        say('전송에 실패했습니다. <a href="mailto:' + SITE.email +
            '" style="color:#96421F;text-decoration:underline;">' + SITE.email +
            '</a> 로 보내주시면 동일하게 접수됩니다.', 'bad');
      });
  });
})();

/* ---------- 연도 자동 갱신 ---------- */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
