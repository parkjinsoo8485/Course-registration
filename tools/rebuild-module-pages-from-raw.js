const fs = require("fs");
const path = require("path");

const pages = [
  { raw: "applicants.html", out: "applicants.html", key: "applicants", heading: "신청자관리", title: "신청목록 - 신청자관리 - 늘봄학교" },
  { raw: "wait.html", out: "waitlist.html", key: "wait", heading: "대기자관리", title: "대기자 목록 - 대기자관리 - 늘봄학교" },
  { raw: "refund.html", out: "refund.html", key: "refund", heading: "환불/취소관리", title: "신청목록 - 환불/취소관리 - 늘봄학교" },
  { raw: "fund-target.html", out: "fund-targets.html", key: "fund-target", heading: "대상자관리", title: "목록 - 지원금관리 > 대상자관리 - 늘봄학교" },
  { raw: "fund-app.html", out: "fund-apps.html", key: "fund-app", heading: "수강자관리", title: "목록 - 지원금관리 > 수강자관리 - 늘봄학교" },
  { raw: "fund-cfg.html", out: "fund-config.html", key: "fund-cfg", heading: "지원금설정", title: "지원금설정 - 지원금관리 - 늘봄학교" },
  { raw: "fund-rank.html", out: "fund-rank.html", key: "fund-rank", heading: "순위구분설정", title: "자유수강권 > 순위구분설정 - 지원금관리 - 늘봄학교" },
  { raw: "teacher.html", out: "teacher.html", key: "teacher", heading: "강사관리", title: "목록 - 강사관리 - 늘봄학교" },
  { raw: "survey.html", out: "survey.html", key: "survey", heading: "설문", title: "목록 - 설문 - 늘봄학교" },
  { raw: "survey-sample.html", out: "survey-sample.html", key: "survey-sample", heading: "샘플설문", title: "목록 - 샘플설문 - 늘봄학교" },
  { raw: "cfg-basic.html", out: "cfg-basic.html", key: "cfg-basic", heading: "기본설정", title: "기본설정 - 환경설정 - 늘봄학교" },
  { raw: "cfg-period.html", out: "cfg-period.html", key: "cfg-period", heading: "신청기간", title: "신청기간 > 목록 - 환경설정 - 늘봄학교" },
  { raw: "cfg-lecture-time.html", out: "cfg-lecture-time.html", key: "cfg-lecture-time", heading: "강의시간", title: "강의시간 설정 - 환경설정 - 늘봄학교" },
  { raw: "cfg-division.html", out: "cfg-division.html", key: "cfg-division", heading: "강좌구분", title: "강좌구분 설정 - 환경설정 - 늘봄학교" },
  { raw: "cfg-group.html", out: "cfg-group.html", key: "cfg-group", heading: "중복제한그룹", title: "중복제한그룹 설정 - 환경설정 - 늘봄학교" },
  { raw: "cfg-verify.html", out: "cfg-verify.html", key: "cfg-verify", heading: "학적검증", title: "학적검증 - 환경설정 - 늘봄학교" },
  { raw: "cfg-neis.html", out: "cfg-neis.html", key: "cfg-neis", heading: "나이스/에듀파인 설정", title: "강사 목록 - 나이스/에듀파인 설정 - 늘봄학교" },
  { raw: "notification.html", out: "notification.html", key: "notification", heading: "알림관리", title: "알림목록 - 알림관리 - 늘봄학교" }
];

function extractContents(raw) {
  const start = raw.indexOf('<div id="contents">');
  const end = raw.indexOf('<div id="footer">');
  if (start < 0 || end < 0 || end <= start) return "";
  let content = raw.slice(start + '<div id="contents">'.length, end).trim();
  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  return content;
}

for (const p of pages) {
  const rawPath = path.resolve("captures", "sidebar", p.raw);
  if (!fs.existsSync(rawPath)) {
    // Keep current local file as fallback.
    continue;
  }

  const raw = fs.readFileSync(rawPath, "utf8");
  const content = extractContents(raw);
  if (!content) continue;

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title}</title>
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
          <div class="title-main"><i class="fa fa-file-text-o"></i> ${p.heading}</div>
          <div class="title-sub">운천초등학교 늘봄학교</div>
        </div>
      </div>
      <div id="contents" class="content-inner module-raw-content">
${content}
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
  fs.writeFileSync(path.resolve(p.out), html, "utf8");
}

console.log("rebuilt module pages from raw sidebar captures");
