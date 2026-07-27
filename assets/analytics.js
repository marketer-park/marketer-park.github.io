/* ============================================================
   측정 스크립트 (Google Analytics 4 / Google Tag)

   ▼ 설정: 아래 GA_ID 한 줄만 채우면 전 페이지에 적용됩니다.
      GA4 > 관리 > 데이터 스트림 에서 확인한 '측정 ID'
      형태: G-XXXXXXXXXX
      비워두면 아무것도 로드되지 않습니다 (사이트 속도 영향 없음).
   ============================================================ */

var GA_ID = '';

(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  if (!GA_ID) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  (document.head || document.documentElement).appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_ID);
})();

/* 전환 이벤트 헬퍼 — 진단 신청 완료 시 호출됩니다 */
window.trackLead = function (detail) {
  try {
    gtag('event', 'generate_lead', {
      event_category: 'diagnosis',
      event_label: '무료 광고 진단 신청',
      industry: (detail && detail.industry) || '',
      budget: (detail && detail.budget) || '',
      value: 1,
      currency: 'KRW'
    });
  } catch (e) {}
};
