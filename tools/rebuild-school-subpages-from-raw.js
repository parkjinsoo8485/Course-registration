const fs = require("fs");
const path = require("path");

const pages = [
  {
    raw: "teacher-lists.html",
    out: "school-teacher.html",
    active: "teacher_lists",
    heading: "교직원관리",
    title: "목록 - 교직원관리 - 학교관리",
  },
  {
    raw: "teacher-field.html",
    out: "school-teacher-field.html",
    active: "teacher_field",
    heading: "인원필드설정",
    title: "회원필드설정 - 교직원관리 - 학교관리",
  },
  {
    raw: "teacher-level.html",
    out: "school-teacher-level.html",
    active: "teacher_level",
    heading: "직위명설정",
    title: "직위명 설정 - 교직원관리 - 학교관리",
  },
  {
    raw: "teacher-clear.html",
    out: "school-teacher-clear.html",
    active: "teacher_clear",
    heading: "교직원 초기화",
    title: "초기화 - 교직원관리 - 학교관리",
  },
  {
    raw: "student-lists.html",
    out: "school-student.html",
    active: "student_lists",
    heading: "학생관리",
    title: "목록 - 학생관리 - 학교관리",
  },
  {
    raw: "student-main.html",
    out: "school-student-main.html",
    active: "student_main",
    heading: "학생 기본설정",
    title: "기본설정 - 학생관리 - 학교관리",
  },
  {
    raw: "student-field.html",
    out: "school-student-field.html",
    active: "student_field",
    heading: "학생 인원필드설정",
    title: "회원필드설정 - 학생관리 - 학교관리",
  },
  {
    raw: "student-course.html",
    out: "school-student-course.html",
    active: "student_course",
    heading: "입학/졸업",
    title: "학과 설정 - 학생관리 - 학교관리",
  },
  {
    raw: "student-clear.html",
    out: "school-student-clear.html",
    active: "student_clear",
    heading: "학생 초기화",
    title: "초기화 - 학생관리 - 학교관리",
  },
  {
    raw: "sms-tel.html",
    out: "school-sms-tel.html",
    active: "sms_tel",
    heading: "발신번호관리",
    title: "목록 - 문자관리 > 발신번호관리 - 학교관리",
  },
  {
    raw: "sms-sin.html",
    out: "school-sms-sin.html",
    active: "sms_sin",
    heading: "충전신청",
    title: "목록 - 문자관리 > 충전신청 - 학교관리",
  },
  {
    raw: "sms-charge.html",
    out: "school-sms-charge.html",
    active: "sms_charge",
    heading: "충전내역",
    title: "목록 - 문자관리 > 충전내역 - 학교관리",
  },
  {
    raw: "sms-report.html",
    out: "school-sms-report.html",
    active: "sms_report",
    heading: "발송통계",
    title: "목록 - 문자관리 > 발송통계 - 학교관리",
  },
];

function item(active, key, href, label) {
  const cls = active === key ? ' class="active"' : "";
  return `<li${cls}><a href="./${href}">${label}</a></li>`;
}

function schoolSidebar(active) {
  return `
    <aside id="left_menu" class="sidebar school-sidebar">
      <div class="sidebar-user">
        <div class="avatar"><i class="fa fa-user"></i></div>
        <div class="user-meta">
          <div class="user-name-row"><span class="user-name">박진수님</span></div>
          <div class="user-role"><a href="#">로그아웃</a> <span class="muted">정보수정</span></div>
        </div>
      </div>
      <ul class="nav side-nav">
        <li><a href="./index.html"><i class="fa fa-tachometer"></i> 늘봄학교 보기</a></li>
        <li><a href="./school.html"><i class="fa fa-sitemap"></i> 서비스목록</a></li>
        <li class="nav-section active">
          <a data-toggle="collapse" href="#school-teacher"><i class="fa fa-user"></i> 교직원관리 <span class="caret"></span></a>
          <ul id="school-teacher" class="collapse in">
            ${item(active, "teacher_lists", "school-teacher.html", "교직원관리")}
            ${item(active, "teacher_field", "school-teacher-field.html", "인원필드설정")}
            ${item(active, "teacher_level", "school-teacher-level.html", "직위명설정")}
            ${item(active, "teacher_clear", "school-teacher-clear.html", "초기화")}
          </ul>
        </li>
        <li class="nav-section active">
          <a data-toggle="collapse" href="#school-student"><i class="fa fa-user"></i> 학생관리 <span class="caret"></span></a>
          <ul id="school-student" class="collapse in">
            ${item(active, "student_lists", "school-student.html", "학생관리")}
            ${item(active, "student_main", "school-student-main.html", "기본설정")}
            ${item(active, "student_field", "school-student-field.html", "인원필드설정")}
            ${item(active, "student_course", "school-student-course.html", "입학/졸업")}
            ${item(active, "student_clear", "school-student-clear.html", "초기화")}
          </ul>
        </li>
        <li class="nav-section active">
          <a data-toggle="collapse" href="#school-sms"><i class="fa fa-comment"></i> 문자관리 <span class="caret"></span></a>
          <ul id="school-sms" class="collapse in">
            ${item(active, "sms_tel", "school-sms-tel.html", "발신번호관리")}
            ${item(active, "sms_sin", "school-sms-sin.html", "충전신청")}
            ${item(active, "sms_charge", "school-sms-charge.html", "충전내역")}
            ${item(active, "sms_report", "school-sms-report.html", "발송통계")}
          </ul>
        </li>
      </ul>
    </aside>
  `;
}

function extractContents(raw) {
  const marker = '<div id="contents">';
  const a = raw.indexOf(marker);
  const b = raw.indexOf('<div id="footer">');
  if (a < 0 || b < 0 || b <= a) return "";
  let content = raw.slice(a + marker.length, b).trim();
  // Remove inline scripts from raw to avoid runtime errors in local clone.
  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  return content;
}

for (const p of pages) {
  const rawPath = path.resolve("captures", "school-raw", p.raw);
  if (!fs.existsSync(rawPath)) continue;
  const raw = fs.readFileSync(rawPath, "utf8");
  const content = extractContents(raw);

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
<body class="school-admin-page">
  <div id="header" class="topbar">
    <div class="topbar-inner">
      <div class="topbar-center"><span class="topbar-title">학교관리</span></div>
    </div>
  </div>
  <div id="container" class="layout">
    ${schoolSidebar(p.active)}
    <main id="contents_box" class="content">
      <div id="contents_title" class="page-title">
        <div class="title-left">
          <div class="title-main"><i class="fa fa-file-text-o"></i> ${p.heading}</div>
          <div class="title-sub">운천초등학교 학교관리</div>
        </div>
      </div>
      <div id="contents" class="content-inner school-raw-content">
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

console.log("rebuilt school subpages from raw html");
