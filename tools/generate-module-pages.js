const fs = require("fs");
const path = require("path");

const pages = [
  { file: "school.html", key: "school", title: "서비스목록", subtitle: "학교관리", seed: ["늘봄학교 서비스 사용중", "문자서비스 사용중", "학부모앱 연동"] },
  { file: "applicants.html", key: "applicants", title: "신청목록", subtitle: "신청자관리", seed: ["2월 영어A반 신청자 확인", "돌봄교실 신청자 현황", "신청자 이동 요청"] },
  { file: "waitlist.html", key: "wait", title: "대기자 목록", subtitle: "대기자관리", seed: ["영어A반 대기자", "코딩반 대기자", "미술반 대기자"] },
  { file: "refund.html", key: "refund", title: "신청목록", subtitle: "환불/취소관리", seed: ["2월 환불 요청", "강좌 취소 요청", "부분 환불 검토"] },
  { file: "fund-targets.html", key: "fund-target", title: "목록", subtitle: "지원금관리 > 대상자관리", seed: ["지원금 대상자 등록", "대상자 자격 변경", "대상자 제외 처리"] },
  { file: "fund-apps.html", key: "fund-app", title: "목록", subtitle: "지원금관리 > 수강자관리", seed: ["지원금 수강자 배정", "지원금 수강자 검증", "지원금 수강자 변경"] },
  { file: "fund-config.html", key: "fund-cfg", title: "지원금설정", subtitle: "지원금관리", seed: ["월 지원한도 설정", "지원비율 설정", "정산주기 설정"] },
  { file: "fund-rank.html", key: "fund-rank", title: "자유수강권 > 순위구분설정", subtitle: "지원금관리", seed: ["우선순위 그룹 A", "우선순위 그룹 B", "우선순위 그룹 C"] },
  { file: "teacher.html", key: "teacher", title: "목록", subtitle: "강사관리", seed: ["강사 권한 설정", "강사 비밀번호 초기화", "강사 변경 처리"] },
  { file: "survey.html", key: "survey", title: "목록", subtitle: "설문", seed: ["수강만족도 설문", "학부모 만족도 설문", "운영개선 설문"] },
  { file: "survey-sample.html", key: "survey-sample", title: "목록", subtitle: "샘플설문", seed: ["기본형 샘플 설문", "만족도 샘플 설문", "수요조사 샘플 설문"] },
  { file: "cfg-basic.html", key: "cfg-basic", title: "기본설정", subtitle: "환경설정", seed: ["학교정보 설정", "운영기간 설정", "기본 안내문 설정"] },
  { file: "cfg-period.html", key: "cfg-period", title: "신청기간 > 목록", subtitle: "환경설정", seed: ["2월 신청기간", "3월 신청기간", "돌봄 신청기간"] },
  { file: "cfg-lecture-time.html", key: "cfg-lecture-time", title: "강의시간 설정", subtitle: "환경설정", seed: ["월 1-2교시", "화 3-4교시", "방과후 시간대"] },
  { file: "cfg-division.html", key: "cfg-division", title: "강좌구분 설정", subtitle: "환경설정", seed: ["방과후", "맞춤형", "돌봄"] },
  { file: "cfg-group.html", key: "cfg-group", title: "중복제한그룹 설정", subtitle: "환경설정", seed: ["영역 중복 제한 그룹", "시간 중복 제한 그룹", "대상학년 중복 제한"] },
  { file: "cfg-verify.html", key: "cfg-verify", title: "학적검증", subtitle: "환경설정", seed: ["학적 데이터 동기화", "검증 오류 목록 확인", "검증 규칙 설정"] },
  { file: "cfg-neis.html", key: "cfg-neis", title: "강사 목록", subtitle: "나이스/에듀파인 설정", seed: ["강사 일괄등록 템플릿", "에듀파인 연동 설정", "나이스 연동 상태"] },
  { file: "notification.html", key: "notification", title: "알림목록", subtitle: "알림관리", seed: ["시스템 점검 공지", "신청기간 안내", "강좌변경 안내"] }
];

function buildPage(p) {
  const seedRows = p.seed.map((title, idx) => ({
    title,
    date: `2026-02-${String(10 + idx).padStart(2, "0")}`,
    status: idx === 0 ? "done" : idx === 1 ? "progress" : "pending",
    note: idx === 0 ? "완료" : "-"
  }));

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title} - ${p.subtitle} - 늘봄학교</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="./assets/css/app.css">
</head>
<body data-sidebar-page="${p.key}">
  <div id="header" class="topbar">
    <div class="topbar-inner">
      <div class="topbar-center">
        <span class="topbar-title">늘봄학교</span>
        <span class="caret"></span>
      </div>
    </div>
  </div>

  <div id="container" class="layout">
    <aside id="left_menu" class="sidebar"></aside>

    <main id="contents_box" class="content">
      <div id="contents_title" class="page-title">
        <div class="title-left">
          <div class="title-main"><i class="fa fa-file-text-o"></i> ${p.subtitle}</div>
          <div class="title-sub">운천초등학교 늘봄학교</div>
        </div>
      </div>

      <div id="contents" class="content-inner module-page"
           data-module-key="${p.key}"
           data-status-map='{"all":"전체","pending":"접수","progress":"처리중","done":"완료"}'
           data-seed='${JSON.stringify(seedRows).replace(/'/g, "&apos;")}'>
        <div class="panel_main panel-default_main">
          <div class="panel-heading">${p.title}</div>

          <div class="filter-bar">
            <div class="filter-row">
              <select id="module-status" class="form-control input-sm filter-select">
                <option value="all">=진행상태=</option>
                <option value="pending">접수</option>
                <option value="progress">처리중</option>
                <option value="done">완료</option>
              </select>
              <input id="module-search" class="form-control input-sm filter-input" placeholder="검색어">
              <button id="btn-module-search" type="button" class="btn btn-default btn-sm">검색</button>
              <button id="btn-module-reset" type="button" class="btn btn-default btn-sm">전체</button>
            </div>
            <div class="filter-row" style="margin-top:8px;">
              <input id="module-title" class="form-control input-sm filter-input" placeholder="신규 항목 제목">
              <button id="btn-module-add" type="button" class="btn btn-primary btn-sm">등록</button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="table table-bordered table-hover table-condensed align-center" style="margin-bottom:0;">
              <thead>
                <tr>
                  <th style="width:60px;">연번</th>
                  <th>제목</th>
                  <th style="width:110px;">등록일자</th>
                  <th style="width:80px;">진행</th>
                  <th style="width:60px;">비고</th>
                </tr>
              </thead>
              <tbody id="module-list"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="footer" class="footer"><span class="muted">DBDB School Clone</span></div>
    </main>
  </div>

  <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  <script src="./assets/js/app.js"></script>
</body>
</html>
`;
}

for (const p of pages) {
  const outPath = path.resolve(p.file);
  fs.writeFileSync(outPath, buildPage(p), "utf8");
}

console.log(`generated ${pages.length} pages`);
