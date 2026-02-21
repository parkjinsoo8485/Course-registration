const fs = require("fs");
const path = require("path");

const pages = [
  {
    file: "school-teacher.html",
    title: "목록 - 교직원관리 - 학교관리",
    heading: "교직원관리",
    moduleKey: "school_teacher_lists",
    active: "teacher_lists",
    seed: ["교직원 기본정보", "담당업무 배정", "권한 설정"]
  },
  {
    file: "school-teacher-field.html",
    title: "인원필드설정 - 교직원관리 - 학교관리",
    heading: "인원필드설정",
    moduleKey: "school_teacher_field",
    active: "teacher_field",
    seed: ["필드 추가", "필드 순서 변경", "필드 표시 여부"]
  },
  {
    file: "school-teacher-level.html",
    title: "직위명설정 - 교직원관리 - 학교관리",
    heading: "직위명설정",
    moduleKey: "school_teacher_level",
    active: "teacher_level",
    seed: ["교감", "부장교사", "담당교사"]
  },
  {
    file: "school-teacher-clear.html",
    title: "초기화 - 교직원관리 - 학교관리",
    heading: "교직원 초기화",
    moduleKey: "school_teacher_clear",
    active: "teacher_clear",
    seed: ["초기화 전 백업", "초기화 실행", "초기화 이력 확인"]
  },
  {
    file: "school-student.html",
    title: "목록 - 학생관리 - 학교관리",
    heading: "학생관리",
    moduleKey: "school_student_lists",
    active: "student_lists",
    seed: ["학생 명단 확인", "학년/반 수정", "재학 상태 관리"]
  },
  {
    file: "school-student-main.html",
    title: "기본설정 - 학생관리 - 학교관리",
    heading: "학생 기본설정",
    moduleKey: "school_student_main",
    active: "student_main",
    seed: ["학년 체계 설정", "반 체계 설정", "기본값 설정"]
  },
  {
    file: "school-student-field.html",
    title: "인원필드설정 - 학생관리 - 학교관리",
    heading: "학생 인원필드설정",
    moduleKey: "school_student_field",
    active: "student_field",
    seed: ["필드 추가", "필수 입력 설정", "표시 순서 설정"]
  },
  {
    file: "school-student-course.html",
    title: "입학/졸업 - 학생관리 - 학교관리",
    heading: "입학/졸업",
    moduleKey: "school_student_course",
    active: "student_course",
    seed: ["입학 처리", "졸업 처리", "진급 일괄 처리"]
  },
  {
    file: "school-student-clear.html",
    title: "초기화 - 학생관리 - 학교관리",
    heading: "학생 초기화",
    moduleKey: "school_student_clear",
    active: "student_clear",
    seed: ["초기화 전 확인", "초기화 실행", "복구 방법 안내"]
  },
  {
    file: "school-sms-tel.html",
    title: "발신번호관리 - 문자관리 - 학교관리",
    heading: "발신번호관리",
    moduleKey: "school_sms_tel",
    active: "sms_tel",
    seed: ["대표 발신번호 등록", "발신번호 인증", "발신번호 삭제"]
  },
  {
    file: "school-sms-sin.html",
    title: "충전신청 - 문자관리 - 학교관리",
    heading: "충전신청",
    moduleKey: "school_sms_sin",
    active: "sms_sin",
    seed: ["충전금액 선택", "결제 요청", "신청 내역 확인"]
  },
  {
    file: "school-sms-charge.html",
    title: "충전내역 - 문자관리 - 학교관리",
    heading: "충전내역",
    moduleKey: "school_sms_charge",
    active: "sms_charge",
    seed: ["최근 충전 내역", "월별 합계", "결제 상태 확인"]
  },
  {
    file: "school-sms-report.html",
    title: "발송통계 - 문자관리 - 학교관리",
    heading: "발송통계",
    moduleKey: "school_sms_report",
    active: "sms_report",
    seed: ["일별 발송 건수", "실패 건수", "월별 리포트"]
  }
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

function pageTemplate(p) {
  const seedRows = p.seed.map((title, idx) => ({
    title,
    date: `2026-02-${String(16 + idx).padStart(2, "0")}`,
    status: idx === 0 ? "done" : idx === 1 ? "progress" : "pending",
    note: idx === 0 ? "완료" : "-"
  }));

  return `<!doctype html>
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
      <div class="topbar-center">
        <span class="topbar-title">학교관리</span>
      </div>
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

      <div id="contents" class="content-inner module-page"
           data-module-key="${p.moduleKey}"
           data-status-map='{"all":"전체","pending":"접수","progress":"처리중","done":"완료"}'
           data-seed='${JSON.stringify(seedRows).replace(/'/g, "&apos;")}'>
        <div class="panel_main panel-default_main">
          <div class="panel-heading">목록</div>
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
  fs.writeFileSync(path.resolve(p.file), pageTemplate(p), "utf8");
}

console.log(`generated ${pages.length} school subpages`);
