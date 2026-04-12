(function () {
  "use strict";

  if (typeof window.jQuery === "undefined") {
    console.error("jQuery not loaded. app.js handlers are disabled.");
    return;
  }

  var $ = window.jQuery;
  var STORE_KEY = "dbdb_lectures_v2";
  var MODULE_PREFIX = "dbdb_module_";
  var FUND_CFG_SORT_ORDER_KEY = MODULE_PREFIX + "fund_cfg_sort_order";
  var FUND_CFG_SORT_ITEMS_KEY = MODULE_PREFIX + "fund_cfg_sort_items";

  function applyPageFileClass() {
    var pathname = String(window.location.pathname || "");
    var file = pathname.split("/").pop() || "index.html";
    var base = file
      .replace(/\.html$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (!base) base = "index";
    $("body").addClass("page-" + base);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSidebar(activeKey) {
    var isFunding =
      ["fund-target", "fund-app", "fund-cfg", "fund-rank"].indexOf(activeKey) >
      -1;
    var isSurvey =
      ["survey", "survey-sample", "survey-sample-write"].indexOf(activeKey) >
      -1;
    var isSettings =
      [
        "cfg-basic",
        "cfg-period",
        "cfg-lecture-time",
        "cfg-division",
        "cfg-group",
        "cfg-verify",
        "cfg-neis",
        "cfg-message",
        "cfg-clear",
        "cfg-manager",
      ].indexOf(activeKey) > -1;

    function li(key, href, icon, text) {
      var cls = key === activeKey ? ' class="active"' : "";
      return (
        "<li" +
        cls +
        '><a href="' +
        href +
        '"><i class="fa ' +
        icon +
        '"></i> ' +
        text +
        "</a></li>"
      );
    }

    function childLi(key, href, text) {
      var cls = key === activeKey ? ' class="active"' : "";
      return "<li" + cls + '><a href="' + href + '">' + text + "</a></li>";
    }

    return [
      '<div class="sidebar-user">',
      '  <div class="avatar"><i class="fa fa-user"></i></div>',
      '  <div class="user-meta">',
      '    <div class="user-name-row">',
      '      <span class="user-name">박진수님</span>',
      '      <span class="user-bell"><i class="fa fa-bell"></i><span class="badge badge-red">24</span></span>',
      "    </div>",
      '    <div class="user-role">[로그아웃] <span class="muted">[정보수정]</span></div>',
      "  </div>",
      "</div>",
      '<div class="sidebar-actions">',
      '  <a href="./index.html" class="btn btn-success btn-sm">홈으로</a>',
      '  <a href="./lec_write.html" class="btn btn-danger btn-sm">강좌등록</a>',
      "</div>",
      '<ul class="nav side-nav">',
      li("manual", "./manual.html", "fa-download", "매뉴얼"),
      li("qanda", "./qanda.html", "fa-phone", "고객지원 게시판"),
      li("school", "./school.html", "fa-cog icon-red", "학교관리"),
      li("lecture", "./index.html", "fa-futbol-o icon-blue", "강좌관리"),
      li("applicants", "./applicants.html", "fa-slideshare", "신청자관리"),
      li("wait", "./waitlist.html", "fa-slideshare", "대기자관리"),
      li("refund", "./refund.html", "fa-slideshare", "환불/취소관리"),
      '<li class="nav-section' + (isFunding ? " active" : "") + '">',
      '  <a href="./fund-targets.html"><i class="fa fa-university"></i> 지원금관리 <span class="caret"></span></a>',
      '  <ul id="menu-funding" class="collapse in">',
      childLi("fund-target", "./fund-targets.html", "대상자관리"),
      childLi("fund-app", "./fund-apps.html", "수강자관리"),
      childLi("fund-cfg", "./fund-config.html", "지원금설정"),
      childLi("fund-rank", "./fund-rank.html", "순위구분설정"),
      "  </ul>",
      "</li>",
      li("teacher", "./teacher.html", "fa-briefcase", "강사관리"),
      '<li class="nav-section' + (isSurvey ? " active" : "") + '">',
      '  <a data-toggle="collapse" href="#menu-survey"><i class="fa fa-pie-chart"></i> 설문관리 <span class="caret"></span></a>',
      '  <ul id="menu-survey" class="collapse in">',
      childLi("survey", "./survey.html", "설문"),
      childLi("survey-sample", "./survey-sample.html", "샘플설문"),
      "  </ul>",
      "</li>",
      '<li class="nav-section' + (isSettings ? " active" : "") + '">',
      '  <a data-toggle="collapse" href="#menu-settings"><i class="fa fa-cog"></i> 환경설정 <span class="caret"></span></a>',
      '  <ul id="menu-settings" class="collapse in">',
      childLi("cfg-basic", "./cfg-basic.html", "기본설정"),
      childLi("cfg-period", "./cfg-period.html", "신청기간"),
      childLi("cfg-lecture-time", "./cfg-lecture-time.html", "강의시간"),
      childLi("cfg-division", "./cfg-division.html", "강좌구분"),
      childLi("cfg-group", "./cfg-group.html", "중복제한그룹"),
      childLi("cfg-verify", "./cfg-verify.html", "학적검증"),
      childLi("cfg-neis", "./cfg-neis.html", "나이스/에듀파인 설정"),
      childLi("cfg-message", "./cfg-basic.html?section=message", "안내글설정"),
      childLi("cfg-clear", "./cfg-basic.html?section=clear", "초기화"),
      childLi("cfg-manager", "./cfg-basic.html?section=manager", "담당자정보"),
      "  </ul>",
      "</li>",
      li("notification", "./notification.html", "fa-volume-up", "알림관리"),
      li(
        "push-notification",
        "./notification.html?tab=push",
        "fa-bell",
        "푸시알림관리",
      ),
      '<li><a href="./notification.html?tab=extension" class="has-badge"><span><i class="fa fa-calendar-o"></i> 연장신청</span><span class="badge badge-grey">372일 남음</span></a></li>',
      li(
        "survey-participation",
        "./survey.html?mode=participation",
        "fa-pie-chart",
        "설문참여",
      ),
      "</ul>",
    ].join("");
  }

  function applyUnifiedSidebar() {
    var activeKey = String($("body").data("sidebar-page") || "").trim();
    if (!activeKey) return;
    var $left = $("#left_menu");
    if (!$left.length) return;
    $left.html(renderSidebar(activeKey));
  }

  function normalizeUserRole() {
    $(".user-role").html(
      '<span class="muted">[<a href="./login.html" id="profile-logout">로그아웃</a>] [<a href="./cfg-basic.html">정보수정</a>]</span>',
    );
  }

  function bindLogoutAction() {
    $(document).on(
      "click",
      "#profile-logout, .sidebar-actions a[href='./login.html']",
      function (event) {
        event.preventDefault();
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        }).finally(function () {
          window.location.replace("./login.html");
        });
      },
    );
  }

  function requireAuth() {
    if ($("body").data("public-page")) return;
    if (!$(".sidebar, #left_menu").length) return;

    fetch("/api/auth/session", { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("unauthorized");
        return response.json();
      })
      .then(function (payload) {
        if (!payload || !payload.user) throw new Error("unauthorized");
        $(".user-name").text(
          payload.user.displayName || payload.user.loginId || "운영자",
        );
      })
      .catch(function () {
        var current = window.location.pathname.split("/").pop() || "index.html";
        window.location.replace(
          "./login.html?returnTo=" + encodeURIComponent(current),
        );
      });
  }

  function nowStamp() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    return "" + y + m + day + "-" + hh + mm;
  }

  function notify(msg) {
    window.alert(msg);
  }

  function escapeCsv(value) {
    var v = value == null ? "" : String(value).replace(/\s+/g, " ").trim();
    return '"' + v.replace(/"/g, '""') + '"';
  }

  function csvSplit(line) {
    var out = [];
    var cur = "";
    var inQuote = false;
    for (var i = 0; i < line.length; i += 1) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === "," && !inQuote) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  }

  function parseCsvText(text) {
    var lines = String(text || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(function (l) {
        return l.trim() !== "";
      });

    if (!lines.length) return { header: [], rows: [] };

    var header = csvSplit(lines[0]).map(function (h) {
      return h.replace(/^"|"$/g, "").trim();
    });

    var rows = lines.slice(1).map(function (line) {
      var cols = csvSplit(line).map(function (c) {
        return c.replace(/^"|"$/g, "").trim();
      });
      var obj = {};
      header.forEach(function (h, idx) {
        obj[h] = cols[idx] || "";
      });
      return obj;
    });

    return { header: header, rows: rows };
  }

  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadCsv(filename, lines) {
    var blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    downloadBlob(filename, blob);
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    downloadBlob(filename, blob);
  }

  function readTableAsCsvLines($table, rowSelector) {
    var lines = [];
    var header = [];

    $table.find("thead th").each(function () {
      header.push(escapeCsv($(this).text()));
    });
    lines.push(header.join(","));

    $table.find(rowSelector).each(function () {
      var cells = [];
      $(this)
        .find("td")
        .each(function () {
          cells.push(escapeCsv($(this).text()));
        });
      lines.push(cells.join(","));
    });

    return lines;
  }

  function getSearchParams() {
    try {
      return new URLSearchParams(window.location.search || "");
    } catch (e) {
      return null;
    }
  }

  function loadJson(key, fallbackValue) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallbackValue;
      return JSON.parse(raw);
    } catch (e) {
      return fallbackValue;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function collectFundConfigSortItems() {
    if (String($("body").data("sidebar-page") || "") !== "fund-cfg") return [];
    var items = [];
    $(".module-raw-content form[id^='fm_edit']").each(function () {
      var $form = $(this);
      var num = String(
        $form.find("input[name='free2_data_num']").first().val() || "",
      ).trim();
      if (!num) return;
      var $title = $form.find("input[id^='free2_data'][id$='_title']").first();
      var title = String($title.val() || "").trim();
      if (!title) title = "지원금" + num;
      items.push({ id: num, title: title });
    });
    return items;
  }

  function applyFundConfigSortOrder(orderList) {
    if (String($("body").data("sidebar-page") || "") !== "fund-cfg")
      return false;
    var $panel = $(
      ".module-raw-content .panel_main.panel-default_main",
    ).first();
    if (!$panel.length) return false;

    var formsById = {};
    var currentIds = [];
    $panel.find("form[id^='fm_edit']").each(function () {
      var $form = $(this);
      var id = String(
        $form.find("input[name='free2_data_num']").first().val() || "",
      ).trim();
      if (!id) return;
      formsById[id] = $form;
      currentIds.push(id);
    });
    if (!currentIds.length) return false;

    var desired = [];
    (Array.isArray(orderList) ? orderList : []).forEach(function (id) {
      var sid = String(id || "").trim();
      if (sid && formsById[sid] && desired.indexOf(sid) < 0) desired.push(sid);
    });
    currentIds.forEach(function (id) {
      if (desired.indexOf(id) < 0) desired.push(id);
    });

    desired.forEach(function (id) {
      $panel.append(formsById[id]);
    });
    return true;
  }

  function bindFundConfigPage() {
    if (String($("body").data("sidebar-page") || "") !== "fund-cfg") return;
    var items = collectFundConfigSortItems();
    if (items.length) saveJson(FUND_CFG_SORT_ITEMS_KEY, items);

    var savedOrder = loadJson(FUND_CFG_SORT_ORDER_KEY, []);
    if (Array.isArray(savedOrder) && savedOrder.length) {
      applyFundConfigSortOrder(savedOrder);
    }

    window.addEventListener("storage", function (evt) {
      if (!evt || evt.key !== FUND_CFG_SORT_ORDER_KEY) return;
      var order = loadJson(FUND_CFG_SORT_ORDER_KEY, []);
      if (Array.isArray(order) && order.length) applyFundConfigSortOrder(order);
    });
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("store parse failed", e);
      return [];
    }
  }

  function saveStore(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list || []));
  }

  function nextId(list) {
    var max = 0;
    (list || []).forEach(function (x) {
      var n = Number(x.id) || 0;
      if (n > max) max = n;
    });
    return max + 1;
  }

  function parseStatusFromText(text) {
    if (text.indexOf("종료") > -1) return 2;
    if (text.indexOf("출력") > -1) return 1;
    return 0;
  }

  function statusLabel(v) {
    if (String(v) === "2") return "종료";
    if (String(v) === "1") return "출력";
    return "대기";
  }

  function statusBtnClass(v) {
    if (String(v) === "2") return "btn btn-primary isu_status_sm";
    if (String(v) === "1") return "btn btn-danger isu_status_sm";
    return "btn btn-default isu_status_sm";
  }

  function seedFromIndexTable() {
    var list = loadStore();
    if (list.length) return;

    var seeded = [];
    $(".lecture-table tbody tr").each(function () {
      var $tr = $(this);
      var id = Number($tr.data("num")) || 0;
      if (!id) return;

      var divText = ($tr.find("td:eq(3)").text() || "")
        .replace(/\s+/g, " ")
        .trim();
      var div = divText.match(/\d+월/) ? divText.match(/\d+월/)[0] : "2월";
      var proType =
        divText.indexOf("방과후") > -1
          ? "방과후"
          : divText.indexOf("맞춤형") > -1
            ? "맞춤형"
            : "돌봄";

      var sinText = ($tr.find("td:eq(6)").text() || "")
        .replace(/\s+/g, " ")
        .trim();
      var waitText = ($tr.find("td:eq(7)").text() || "")
        .replace(/\s+/g, " ")
        .trim();
      var sinParts = sinText.split("/").map(function (x) {
        return Number(x.replace(/[^0-9]/g, "")) || 0;
      });
      var waitParts = waitText.split("/").map(function (x) {
        return Number(x.replace(/[^0-9]/g, "")) || 0;
      });

      var periodText = ($tr.find("td:eq(9)").text() || "").replace(/\s+/g, "");
      var period = periodText.split("~");

      seeded.push({
        id: id,
        div: div,
        proType: proType,
        name: ($tr.find("td:eq(4)").text() || "").trim(),
        teacherId: ($tr.find("td:eq(5)").text() || "").trim(),
        applied: sinParts[0] || 0,
        capacity: sinParts[1] || 0,
        waitApplied: waitParts[0] || 0,
        waitCapacity: waitParts[1] || 0,
        grades: ($tr.find("td:eq(8)").text() || "").replace(/\s+/g, ""),
        periodStart: period[0] || "",
        periodEnd: period[1] || "",
        lectureTime: ($tr.find("td:eq(10)").html() || "")
          .replace(/<br\s*\/?\>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .trim(),
        fee:
          Number(
            ($tr.find("td:eq(11)").text() || "0").replace(/[^0-9]/g, ""),
          ) || 0,
        feeVisible: ($tr.find("td:eq(12)").text() || "Y").trim() || "Y",
        teacherClosed: ($tr.find("td:eq(13)").text() || "-").trim() || "-",
        refundClosed: ($tr.find("td:eq(14)").text() || "-").trim() || "-",
        status: parseStatusFromText(
          ($tr.find("td:eq(15)").text() || "").trim(),
        ),
      });
    });

    if (seeded.length) saveStore(seeded);
  }

  function closeAllStatusMenus() {
    $(".isu_choice").hide();
    $(".isu_toggle i").removeClass("fa-angle-up").addClass("fa-angle-down");
  }

  function ajaxPostForm($form, extraData) {
    var url = $form.attr("action");
    var data = $form.serializeArray();

    if (extraData && typeof extraData === "object") {
      Object.keys(extraData).forEach(function (k) {
        data.push({ name: k, value: extraData[k] });
      });
    }

    console.log("[AJAX POST]", url, data);
    return $.Deferred().resolve({ ok: true }).promise();
  }

  function bindPlaceholderLinks() {
    $(document).on("click", 'a[href="#"], a[href="#none;"]', function (e) {
      var $a = $(this);
      if ($a.is("[data-toggle]")) return;
      if ($a.closest(".pagination").length) return;

      if (
        $a.hasClass("max-sin-link") ||
        $a.hasClass("max-wait-link") ||
        $a.hasClass("isu-option") ||
        $a.hasClass("del-link") ||
        $a.hasClass("manual_btn") ||
        /openSortWin\s*\(/i.test(String($a.attr("onclick") || "")) ||
        $a.attr("id") === "btn-template-download" ||
        $a.attr("id") === "btn-modify-template-download" ||
        $a.attr("id") === "main_control_box_btn01" ||
        $a.attr("id") === "main_control_box_btn02"
      ) {
        return;
      }

      e.preventDefault();
      var title = ($a.text() || "준비중 페이지").replace(/\s+/g, " ").trim();
      if (!title) title = "준비중 페이지";
      var dest =
        "./subpage.html?title=" +
        encodeURIComponent(title) +
        "&from=" +
        encodeURIComponent(location.pathname);
      window.location.href = dest;
    });
  }

  function lectureRowHtml(lec) {
    var num = Number(lec.id) || 0;
    var lectureTimeHtml = String(lec.lectureTime || "").replace(/\n/g, "<br>");
    return [
      '<tr data-num="' + num + '">',
      '  <td><input type="checkbox" class="chk-row"></td>',
      "  <td>" + num + "</td>",
      '  <td><button class="btn btn-default btn-xs"><i class="fa fa-cog"></i></button></td>',
      '  <td><span class="label label-default">' +
        (lec.div || "") +
        '</span><br><span class="label label-default">' +
        (lec.proType || "") +
        "</span></td>",
      '  <td class="text-left">' + (lec.name || "") + "</td>",
      "  <td>" + (lec.teacherId || "") + "</td>",
      '  <td class="cell-relative"><span class="count">' +
        (Number(lec.applied) || 0) +
        '</span> / <a href="#" class="max-sin-link" data-max="' +
        (Number(lec.capacity) || 0) +
        '">' +
        (Number(lec.capacity) || 0) +
        "</a></td>",
      "  <td>" +
        (Number(lec.waitApplied) || 0) +
        ' / <a href="#" class="max-wait-link" data-max="' +
        (Number(lec.waitCapacity) || 0) +
        '">' +
        (Number(lec.waitCapacity) || 0) +
        "</a></td>",
      "  <td>" + (lec.grades || "") + "</td>",
      "  <td>" +
        (lec.periodStart || "") +
        "~<br>" +
        (lec.periodEnd || "") +
        "</td>",
      '  <td class="text-left">' + lectureTimeHtml + "</td>",
      "  <td>" + (Number(lec.fee) || 0) + "</td>",
      "  <td>" + (lec.feeVisible || "Y") + "</td>",
      "  <td>" + (lec.teacherClosed || "-") + "</td>",
      "  <td>" + (lec.refundClosed || "-") + "</td>",
      "  <td>",
      '    <div class="isu_wrap">',
      '      <div class="btn-group btn-group-xs isu_check_box">',
      '        <button type="button" class="' +
        statusBtnClass(lec.status) +
        '" id="view_lec_status_' +
        num +
        '">' +
        statusLabel(lec.status) +
        "</button>",
      '        <button type="button" class="btn btn-default isu_toggle"><i class="fa fa-angle-down"></i></button>',
      "      </div>",
      '      <ul class="isu_choice">',
      '        <li><a href="#" class="isu-option" data-status="1" data-label="출력">출력</a></li>',
      '        <li><a href="#" class="isu-option" data-status="0" data-label="대기">대기</a></li>',
      '        <li><a href="#" class="isu-option" data-status="2" data-label="종료">종료</a></li>',
      "      </ul>",
      "    </div>",
      "  </td>",
      '  <td><a href="#" class="del-link"><i class="fa fa-trash"></i></a></td>',
      "</tr>",
    ].join("");
  }

  function getLectureFilterState($form) {
    return {
      month: String($form.find('[name="sld"]').val() || "").trim(),
      process: String(
        $form.find('[name="slp"] option:selected').text() || "",
      ).trim(),
      statusFilter: String($form.find('[name="sls"]').val() || "").trim(),
      grade: String($form.find('[name="s_grade"]').val() || "").trim(),
      target: String($form.find('[name="st"]').val() || "lec_name").trim(),
      keyword: String($form.find('[name="sw"]').val() || "")
        .trim()
        .toLowerCase(),
      dateStart: String($("#s_date_start").val() || "").trim(),
      dateEnd: String($("#s_date_end").val() || "").trim(),
      onlyOpen: $("#s_only_open").is(":checked"),
    };
  }

  function matchesLectureFilter(lec, filter) {
    var statusCode = String(Number(lec.status) || 0);
    var processText = String(lec.proType || "").trim();
    var monthText = String(lec.div || "").trim();
    var gradeText = String(lec.grades || "").replace(/\s+/g, "");
    var lecName = String(lec.name || "").toLowerCase();
    var teaId = String(lec.teacherId || "").toLowerCase();
    var periodJoined = [
      String(lec.periodStart || "").trim(),
      String(lec.periodEnd || "").trim(),
    ].join("~");

    if (filter.month && monthText.indexOf(filter.month) < 0) return false;
    if (
      filter.process &&
      filter.process.indexOf("=") < 0 &&
      processText.indexOf(filter.process) < 0
    )
      return false;
    if (filter.statusFilter && statusCode !== filter.statusFilter) return false;
    if (filter.onlyOpen && statusCode !== "1") return false;
    if (filter.grade && gradeText.indexOf(filter.grade) < 0) return false;
    if (filter.dateStart && periodJoined.indexOf(filter.dateStart) < 0)
      return false;
    if (filter.dateEnd && periodJoined.indexOf(filter.dateEnd) < 0)
      return false;
    if (filter.keyword) {
      if (filter.target === "tea_id") {
        if (teaId.indexOf(filter.keyword) < 0) return false;
      } else if (lecName.indexOf(filter.keyword) < 0) {
        return false;
      }
    }
    return true;
  }

  function getFilteredLectures(filter) {
    return loadStore().filter(function (lec) {
      return matchesLectureFilter(lec, filter);
    });
  }

  function lectureExportLines(list) {
    var lines = [
      [
        "연번",
        "구분",
        "늘봄과정",
        "강좌명",
        "강사ID",
        "신청/정원",
        "대기자/정원",
        "학년",
        "운영기간",
        "강의시간",
        "수강료",
        "수강료출력",
        "강사마감",
        "환불마감",
        "상태",
      ]
        .map(escapeCsv)
        .join(","),
    ];

    (list || []).forEach(function (lec) {
      lines.push(
        [
          escapeCsv(lec.id),
          escapeCsv(lec.div || ""),
          escapeCsv(lec.proType || ""),
          escapeCsv(lec.name || ""),
          escapeCsv(lec.teacherId || ""),
          escapeCsv(
            (Number(lec.applied) || 0) + " / " + (Number(lec.capacity) || 0),
          ),
          escapeCsv(
            (Number(lec.waitApplied) || 0) +
              " / " +
              (Number(lec.waitCapacity) || 0),
          ),
          escapeCsv(lec.grades || ""),
          escapeCsv((lec.periodStart || "") + "~" + (lec.periodEnd || "")),
          escapeCsv(String(lec.lectureTime || "").replace(/\n/g, " / ")),
          escapeCsv(Number(lec.fee) || 0),
          escapeCsv(lec.feeVisible || "Y"),
          escapeCsv(lec.teacherClosed || "-"),
          escapeCsv(lec.refundClosed || "-"),
          escapeCsv(statusLabel(lec.status)),
        ].join(","),
      );
    });

    return lines;
  }

  function renderIndexFromStore() {
    var list = loadStore();
    var $tbody = $(".lecture-table tbody");
    if (!$tbody.length) return;
    $tbody.empty();
    list.forEach(function (lec) {
      $tbody.append(lectureRowHtml(lec));
    });
  }

  function bindIndexPage() {
    if (!$("#fm_list_search").length || !$(".lecture-table").length) return;

    seedFromIndexTable();
    renderIndexFromStore();

    var $form = $("#fm_list_search");

    function updateCheckAllState() {
      var $checked = $(".chk-row:checked");
      var total = $(".chk-row").length;
      var chkAll = $("#check_all").get(0) || $("#chk-all").get(0);
      if (!chkAll) return;
      chkAll.checked = total > 0 && $checked.length === total;
      chkAll.indeterminate = $checked.length > 0 && $checked.length < total;
    }

    function applyFilters() {
      var filter = getLectureFilterState($form);
      var visibleIds = getFilteredLectures(filter).map(function (lec) {
        return String(Number(lec.id) || 0);
      });

      $(".lecture-table tbody tr").each(function () {
        var id = String(Number($(this).data("num")) || 0);
        $(this).toggle(visibleIds.indexOf(id) > -1);
      });

      updateCheckAllState();
    }

    $("#btn-reset").on("click", function () {
      $form.find("select").prop("selectedIndex", 0);
      $form.find('input[type="text"], input[type="search"]').val("");
      $form.find('input[type="checkbox"]').prop("checked", false);
      applyFilters();
    });

    $form.on("submit", function (e) {
      e.preventDefault();
      applyFilters();
    });

    $("#check_all, #chk-all").on("change", function () {
      $(".chk-row").prop("checked", this.checked);
    });

    $("#main_control_box_btn01").on("click", function (e) {
      e.preventDefault();
      var $box = $("#detail-search-box");
      $box.toggle();
      $(this).text($box.is(":visible") ? "상세검색 닫기" : "상세검색 열기");
    });

    $("#main_control_box_btn02").on("click", function (e) {
      e.preventDefault();
      $("#bulk-action-box").toggle();
    });

    $("#btn-apply-bulk").on("click", function () {
      var action = ($("#update_type").val() || "").trim();
      if (!action) {
        notify("일괄 적용 항목을 선택해 주세요.");
        return;
      }

      var ids = $(".lecture-table tbody tr")
        .has(".chk-row:checked")
        .map(function () {
          return Number($(this).data("num"));
        })
        .get();

      if (!ids.length) {
        notify("적용할 강좌를 선택해 주세요.");
        return;
      }

      var list = loadStore();
      if (action === "delete_selected") {
        if (!confirm("선택한 강좌를 삭제하시겠습니까?")) return;
        list = list.filter(function (lec) {
          return ids.indexOf(Number(lec.id)) < 0;
        });
        saveStore(list);
        renderIndexFromStore();
        applyFilters();
        notify("선택 강좌가 삭제되었습니다.");
        return;
      }

      var statusMap = {
        status_1: 1,
        status_0: 0,
        status_2: 2,
      };
      if (Object.prototype.hasOwnProperty.call(statusMap, action)) {
        list = list.map(function (lec) {
          if (ids.indexOf(Number(lec.id)) > -1) lec.status = statusMap[action];
          return lec;
        });
        saveStore(list);
        renderIndexFromStore();
        applyFilters();
        notify("선택 강좌 상태가 변경되었습니다.");
        return;
      }

      var fieldMap = {
        teacher_close_y: {
          field: "teacherClosed",
          value: "Y",
          message: "강사 마감이 일괄 적용되었습니다.",
        },
        teacher_close_n: {
          field: "teacherClosed",
          value: "-",
          message: "강사 마감을 해제했습니다.",
        },
        refund_close_y: {
          field: "refundClosed",
          value: "Y",
          message: "환불 마감이 일괄 적용되었습니다.",
        },
        refund_close_n: {
          field: "refundClosed",
          value: "-",
          message: "환불 마감을 해제했습니다.",
        },
        fee_visible_y: {
          field: "feeVisible",
          value: "Y",
          message: "수강료 출력이 일괄 적용되었습니다.",
        },
        fee_visible_n: {
          field: "feeVisible",
          value: "N",
          message: "수강료 출력을 숨김 처리했습니다.",
        },
      };

      if (Object.prototype.hasOwnProperty.call(fieldMap, action)) {
        var meta = fieldMap[action];
        list = list.map(function (lec) {
          if (ids.indexOf(Number(lec.id)) > -1) lec[meta.field] = meta.value;
          return lec;
        });
        saveStore(list);
        renderIndexFromStore();
        applyFilters();
        notify(meta.message);
        return;
      }

      if (action === "sync_fee_all") {
        notify(
          "신청자 수강료 전체 적용은 목록 데이터까지 연결된 뒤 이어서 맞추겠습니다.",
        );
      }
    });

    $(document).on("change", ".chk-row", updateCheckAllState);

    $(document).on("click", ".isu_check_box", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $wrap = $(this).closest(".isu_wrap");
      var $menu = $wrap.find(".isu_choice");
      var $icon = $wrap.find(".isu_toggle i");

      $(".isu_choice").not($menu).hide();
      $(".isu_toggle i")
        .not($icon)
        .removeClass("fa-angle-up")
        .addClass("fa-angle-down");

      $menu.toggle();
      if ($menu.is(":visible"))
        $icon.removeClass("fa-angle-down").addClass("fa-angle-up");
      else $icon.removeClass("fa-angle-up").addClass("fa-angle-down");
    });

    $(document).on("click", function () {
      closeAllStatusMenus();
      $(".max_sin_box, .max_wait_box").remove();
    });

    $(document).on("click", ".isu-option", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $opt = $(this);
      var statusVal = $opt.data("status");
      var label = $opt.data("label");

      var $tr = $opt.closest("tr");
      var num = Number($tr.data("num"));
      var $statusBtn = $("#view_lec_status_" + num);

      $statusBtn.text(label);
      $statusBtn
        .removeClass("btn-danger btn-default btn-primary")
        .addClass(statusBtnClass(statusVal).replace(" isu_status_sm", ""));

      $("#lec_status_num").val(num);
      $("#lec_status_val").val(statusVal);

      var list = loadStore();
      list = list.map(function (lec) {
        if (Number(lec.id) === num) lec.status = Number(statusVal);
        return lec;
      });
      saveStore(list);

      ajaxPostForm($("#fm_lec_status")).done(function () {
        closeAllStatusMenus();
      });
    });

    function renderQuotaEditor($cell, num, currentMax, type) {
      $(".max_sin_box, .max_wait_box").remove();

      var isWait = type === "wait";
      var boxClass = isWait ? "max_wait_box" : "max_sin_box";
      var saveClass = isWait ? "btn-wait-save" : "btn-max-save";
      var cancelClass = isWait ? "btn-wait-cancel" : "btn-max-cancel";

      var html = [
        '<div class="' + boxClass + '" data-num="' + num + '">',
        '  <input type="number" min="0" class="form-control input-sm max-input" value="' +
          currentMax +
          '"/>',
        '  <button type="button" class="btn btn-primary btn-xs ' +
          saveClass +
          '">수정</button>',
        '  <button type="button" class="btn btn-default btn-xs ' +
          cancelClass +
          '">취소</button>',
        "</div>",
      ].join("");

      $cell.append(html);
    }

    $(document).on("click", ".max-sin-link", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $a = $(this);
      var $tr = $a.closest("tr");
      var num = Number($tr.data("num"));
      var currentMax = parseInt($a.data("max"), 10) || 0;
      renderQuotaEditor($a.closest("td"), num, currentMax, "sin");
    });

    $(document).on("click", ".max-wait-link", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $a = $(this);
      var $tr = $a.closest("tr");
      var num = Number($tr.data("num"));
      var currentMax = parseInt($a.data("max"), 10) || 0;
      renderQuotaEditor($a.closest("td"), num, currentMax, "wait");
    });

    $(document).on("click", ".max_sin_box, .max_wait_box", function (e) {
      e.stopPropagation();
    });

    $(document).on("click", ".btn-max-cancel, .btn-wait-cancel", function () {
      $(".max_sin_box, .max_wait_box").remove();
    });

    $(document).on("click", ".btn-max-save", function () {
      var $box = $(this).closest(".max_sin_box");
      var num = Number($box.data("num"));
      var val = Number($box.find(".max-input").val()) || 0;

      $("#max_sin_num").val(num);
      $("#max_sin_val").val(val);

      var list = loadStore();
      list = list.map(function (lec) {
        if (Number(lec.id) === num) lec.capacity = val;
        return lec;
      });
      saveStore(list);

      ajaxPostForm($("#fm_max_sin")).done(function () {
        var $tr = $('tr[data-num="' + num + '"]');
        var $link = $tr.find(".max-sin-link");
        $link.data("max", val);
        $link.text(val);
        $(".max_sin_box").remove();
      });
    });

    $(document).on("click", ".btn-wait-save", function () {
      var $box = $(this).closest(".max_wait_box");
      var num = Number($box.data("num"));
      var val = Number($box.find(".max-input").val()) || 0;
      var $tr = $('tr[data-num="' + num + '"]');
      var $link = $tr.find(".max-wait-link");
      $link.data("max", val);
      $link.text(val);
      $(".max_wait_box").remove();

      var list = loadStore();
      list = list.map(function (lec) {
        if (Number(lec.id) === num) lec.waitCapacity = val;
        return lec;
      });
      saveStore(list);

      console.log("[AJAX POST] /af/ad_lec/max_wait", {
        num: num,
        max_wait: val,
      });
    });

    $(document).on("click", ".del-link", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $tr = $(this).closest("tr");
      var num = Number($tr.data("num"));

      if (!confirm("삭제하시겠습니까?")) return;

      $("#del_num").val(num);

      var list = loadStore().filter(function (lec) {
        return Number(lec.id) !== num;
      });
      saveStore(list);

      ajaxPostForm($("#fm_del")).done(function () {
        $tr.remove();
        updateCheckAllState();
      });
    });

    $("#btn-excel").on("click", function () {
      var lines = lectureExportLines(
        getFilteredLectures(getLectureFilterState($form)),
      );
      if (lines.length <= 1) {
        notify("내보낼 강좌가 없습니다.");
        return;
      }
      downloadCsv("search-result-" + nowStamp() + ".csv", lines);
    });

    $("#btn-attendance").on("click", function () {
      window.location.href = "./attendance.html";
    });

    applyFilters();
  }

  function validateUploadFile(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files.length) return false;
    var name = inputEl.files[0].name || "";
    return /\.(xlsx|xls|csv)$/i.test(name);
  }

  function readFileText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  }

  function downloadBulkTemplate(kind) {
    var lines = [
      "강좌명,강좌구분,늘봄과정,강사ID,정원,대기정원,운영시작일,운영종료일,강의시간,상태",
      "창의미술,3월,돌봄,teacher01,20,5,2026-03-04,2026-03-28,월 3-4교시,출력",
    ];
    downloadCsv(kind + "-template-" + nowStamp() + ".csv", lines);
  }

  function bindBulkInputPage() {
    if (!$(".fa-upload").length) return;
    var $btn = $("#btn-bulk-input-submit");
    var $fileInput = $("#bulk-input-file");
    var $download = $("#btn-template-download");

    if ($download.length) {
      $download.on("click", function (e) {
        e.preventDefault();
        downloadBulkTemplate("bulk-input");
      });
    }

    if (!$btn.length || !$fileInput.length) return;

    $btn.on("click", async function () {
      var inputEl = $fileInput.get(0);
      if (!validateUploadFile(inputEl)) {
        notify("엑셀 또는 CSV 파일(.xlsx, .xls, .csv)을 선택해 주세요.");
        return;
      }

      var file = inputEl.files[0];
      var list = loadStore();

      if (/\.csv$/i.test(file.name)) {
        var text = await readFileText(file);
        var parsed = parseCsvText(text);
        var added = 0;

        parsed.rows.forEach(function (row) {
          var nm = row["강좌명"] || row["name"] || "";
          if (!nm) return;

          var id = nextId(list);
          var st = row["상태"] || "출력";
          var status = st === "종료" ? 2 : st === "대기" ? 0 : 1;

          list.push({
            id: id,
            div: row["강좌구분"] || "2월",
            proType: row["늘봄과정"] || "돌봄",
            name: nm,
            teacherId: row["강사ID"] || "미정",
            applied: 0,
            capacity: Number(row["정원"] || 0) || 0,
            waitApplied: 0,
            waitCapacity: Number(row["대기정원"] || 0) || 0,
            grades: row["대상학년"] || "1,2,3,4,5,6",
            periodStart: row["운영시작일"] || "",
            periodEnd: row["운영종료일"] || "",
            lectureTime: row["강의시간"] || "",
            fee: Number(row["수강료"] || 0) || 0,
            feeVisible: "Y",
            teacherClosed: "-",
            refundClosed: "-",
            status: status,
          });
          added += 1;
        });

        saveStore(list);
        notify("일괄 등록 완료: " + added + "건");
      } else {
        notify(
          "엑셀 파일 파싱은 데모에서 미지원입니다. CSV 사용을 권장합니다.",
        );
      }

      localStorage.setItem("bulk_input_last_file", file.name);
    });
  }

  function bindBulkModifyPage() {
    if (!$(".fa-edit").length) return;
    var $btn = $("#btn-bulk-modify-submit");
    var $fileInput = $("#bulk-modify-file");
    var $download = $("#btn-modify-template-download");

    if ($download.length) {
      $download.on("click", function (e) {
        e.preventDefault();
        var list = loadStore();
        var lines = ["강좌번호,강좌명,강사ID,정원,대기정원,상태"];
        list.forEach(function (lec) {
          lines.push(
            [
              escapeCsv(lec.id),
              escapeCsv(lec.name),
              escapeCsv(lec.teacherId),
              escapeCsv(lec.capacity),
              escapeCsv(lec.waitCapacity),
              escapeCsv(statusLabel(lec.status)),
            ].join(","),
          );
        });
        downloadCsv("current-lecture-list-" + nowStamp() + ".csv", lines);
      });
    }

    if (!$btn.length || !$fileInput.length) return;

    $btn.on("click", async function () {
      var inputEl = $fileInput.get(0);
      if (!validateUploadFile(inputEl)) {
        notify("수정할 엑셀 또는 CSV 파일(.xlsx, .xls, .csv)을 선택해 주세요.");
        return;
      }

      var file = inputEl.files[0];

      if (/\.csv$/i.test(file.name)) {
        var text = await readFileText(file);
        var parsed = parseCsvText(text);
        var list = loadStore();
        var updated = 0;

        parsed.rows.forEach(function (row) {
          var id = Number(row["강좌번호"] || row["id"] || 0) || 0;
          if (!id) return;
          var idx = list.findIndex(function (x) {
            return Number(x.id) === id;
          });
          if (idx < 0) return;

          var current = list[idx];
          if (row["강좌명"]) current.name = row["강좌명"];
          if (row["강사ID"]) current.teacherId = row["강사ID"];
          if (row["정원"])
            current.capacity = Number(row["정원"]) || current.capacity;
          if (row["대기정원"])
            current.waitCapacity =
              Number(row["대기정원"]) || current.waitCapacity;
          if (row["상태"])
            current.status =
              row["상태"] === "종료" ? 2 : row["상태"] === "대기" ? 0 : 1;

          list[idx] = current;
          updated += 1;
        });

        saveStore(list);
        notify("일괄 수정 완료: " + updated + "건");
      } else {
        notify(
          "엑셀 파일 파싱은 데모에서 미지원입니다. CSV 사용을 권장합니다.",
        );
      }

      localStorage.setItem("bulk_modify_last_file", file.name);
    });
  }

  function bindCopyPage() {
    if (!$(".fa-copy").length) return;
    var $btn = $("#btn-copy-submit");
    var $from = $("#copy-from-div");
    var $to = $("#copy-to-div");
    if (!$btn.length || !$from.length || !$to.length) return;

    (function populateCopySelects() {
      var baseMonths = [
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
        "1월",
        "2월",
      ];
      var existing = loadStore()
        .map(function (lec) {
          return String(lec.div || "").trim();
        })
        .filter(function (v) {
          return !!v;
        });

      var options = baseMonths.slice();
      existing.forEach(function (m) {
        if (options.indexOf(m) === -1) options.push(m);
      });

      function fill($sel) {
        $sel.empty();
        $sel.append('<option value="">선택</option>');
        options.forEach(function (m) {
          $sel.append('<option value="' + m + '">' + m + "</option>");
        });
      }

      fill($from);
      fill($to);

      if (existing.length) {
        $from.val(existing[0]);
        var toCandidate = options.filter(function (m) {
          return m !== existing[0];
        })[0];
        if (toCandidate) $to.val(toCandidate);
      }
    })();

    $btn.on("click", function () {
      var fromVal = ($from.val() || "").trim();
      var toVal = ($to.val() || "").trim();
      if (!fromVal || !toVal) {
        notify("복사 대상/복사될 구분을 모두 선택해 주세요.");
        return;
      }
      if (fromVal === toVal) {
        notify("복사 대상 구분과 복사될 구분이 같습니다.");
        return;
      }

      var list = loadStore();
      var sources = list.filter(function (lec) {
        return String(lec.div) === String(fromVal);
      });
      if (!sources.length) {
        notify("선택한 복사 대상 구분에 강좌가 없습니다.");
        return;
      }

      sources.forEach(function (src) {
        var copy = JSON.parse(JSON.stringify(src));
        copy.id = nextId(list);
        copy.div = toVal;
        copy.applied = 0;
        copy.waitApplied = 0;
        list.push(copy);
      });

      saveStore(list);
      localStorage.setItem(
        "copy_last_operation",
        JSON.stringify({
          from: fromVal,
          to: toVal,
          count: sources.length,
          at: new Date().toISOString(),
        }),
      );
      notify("일괄 복사 완료: " + sources.length + "건");
    });
  }

  function bindStatsPage() {
    if (!$(".fa-bar-chart").length) return;
    var $form = $("#fm-stats-filter");
    var $downloadBtn = $("#btn-stats-download");
    var $table = $(".content-inner table").first();

    function renderStats() {
      if (!$table.length) return;
      var list = loadStore();
      var $selects = $form.find("select");
      var divVal = $selects.eq(0).val() || "";
      var proVal = ($selects.eq(1).find("option:selected").text() || "").trim();

      var filtered = list.filter(function (lec) {
        var ok = true;
        if (divVal) ok = ok && String(lec.div).indexOf(divVal) > -1;
        if (proVal && proVal.indexOf("=") === -1)
          ok = ok && String(lec.proType) === proVal;
        return ok;
      });

      var map = {};
      filtered.forEach(function (lec) {
        var key = String(lec.div) + "|" + String(lec.proType);
        if (!map[key]) {
          map[key] = {
            div: lec.div,
            proType: lec.proType,
            count: 0,
            cap: 0,
            applied: 0,
            fee: 0,
          };
        }
        map[key].count += 1;
        map[key].cap += Number(lec.capacity) || 0;
        map[key].applied += Number(lec.applied) || 0;
        map[key].fee += Number(lec.fee) || 0;
      });

      var rows = Object.keys(map).map(function (k) {
        return map[k];
      });

      var $tbody = $table.find("tbody");
      $tbody.empty();

      var sum = { count: 0, cap: 0, applied: 0, fee: 0 };
      rows.forEach(function (r) {
        sum.count += r.count;
        sum.cap += r.cap;
        sum.applied += r.applied;
        sum.fee += r.fee;
        $tbody.append(
          "<tr>" +
            "<td>" +
            (r.div || "") +
            "</td>" +
            "<td>" +
            (r.proType || "") +
            "</td>" +
            "<td>" +
            r.count +
            "</td>" +
            "<td>" +
            r.cap +
            "</td>" +
            "<td>" +
            r.applied +
            "</td>" +
            "<td>" +
            r.fee +
            "</td>" +
            "</tr>",
        );
      });

      $tbody.append(
        "<tr>" +
          '<td colspan="2" class="text-right"><strong>합계</strong></td>' +
          "<td>" +
          sum.count +
          "</td>" +
          "<td>" +
          sum.cap +
          "</td>" +
          "<td>" +
          sum.applied +
          "</td>" +
          "<td>" +
          sum.fee +
          "</td>" +
          "</tr>",
      );
    }

    if ($form.length) {
      $form.on("submit", function (e) {
        e.preventDefault();
        renderStats();
      });
    }

    if ($downloadBtn.length && $table.length) {
      $downloadBtn.on("click", function () {
        var lines = readTableAsCsvLines($table, "tbody tr");
        if (lines.length <= 1) {
          notify("내보낼 통계가 없습니다.");
          return;
        }
        downloadCsv("lecture-stats-" + nowStamp() + ".csv", lines);
      });
    }

    renderStats();
  }

  function bindQandaPage() {
    var $tbody = $("#qanda-tbody");
    if (!$tbody.length) return;

    var rows = [
      {
        num: 1,
        subject: "돌봄학교 지원금 개별 환불 방법 문의",
        contents: "지원금 처리 과정에서 개별 환불 처리 절차를 문의드립니다.",
        date: "2025-07-23",
        status: "2",
        statusText: "완료",
        answer: "07/23",
      },
      {
        num: 2,
        subject: "신청기간 변경 후 화면 반영 문의",
        contents: "신청기간 변경 후 학생 화면 반영 시점이 궁금합니다.",
        date: "2025-08-01",
        status: "1",
        statusText: "처리중",
        answer: "-",
      },
      {
        num: 3,
        subject: "강좌 일괄수정 엑셀 업로드 오류",
        contents: "일괄수정 엑셀 업로드 시 오류 메시지가 표시됩니다.",
        date: "2025-08-06",
        status: "0",
        statusText: "접수",
        answer: "-",
      },
    ];

    function statusStyle(text) {
      if (text === "완료" || text === "답변완료")
        return 'style="color:#EB9316;"';
      if (text === "처리중") return 'style="color:#337ab7;"';
      return 'style="color:#777;"';
    }

    function rowHtml(item) {
      return (
        "<tr>" +
        "<td>" +
        item.num +
        "</td>" +
        '<td class="text-left"><a href="#" class="link_type">' +
        item.subject +
        "</a></td>" +
        "<td>" +
        item.date +
        "</td>" +
        "<td><span " +
        statusStyle(item.statusText) +
        ">" +
        item.statusText +
        "</span></td>" +
        "<td>" +
        item.answer +
        "</td>" +
        "</tr>"
      );
    }

    function render() {
      var status = ($("#q_status").val() || "all").trim();
      var target = ($("#q_target").val() || "sub_con").trim();
      var word = ($("#q_word").val() || "").trim();

      var filtered = rows.filter(function (x) {
        var ok = true;
        if (status !== "all") ok = ok && x.status === status;
        if (word) {
          if (target === "subject") ok = ok && x.subject.indexOf(word) > -1;
          else if (target === "contents")
            ok = ok && x.contents.indexOf(word) > -1;
          else ok = ok && (x.subject + " " + x.contents).indexOf(word) > -1;
        }
        return ok;
      });

      $tbody.empty();
      if (!filtered.length) {
        $tbody.append(
          '<tr><td colspan="5" class="text-center text-muted">검색 결과가 없습니다.</td></tr>',
        );
        return;
      }
      filtered.forEach(function (item) {
        $tbody.append(rowHtml(item));
      });
    }

    $("#btn-q-search").on("click", render);
    $("#q_status").on("change", render);
    $("#btn-q-reset").on("click", function () {
      $("#q_status").val("all");
      $("#q_target").val("sub_con");
      $("#q_word").val("");
      render();
    });
    $("#btn-q-write").on("click", function () {
      notify("등록 페이지는 준비 중입니다.");
    });

    render();
  }

  function bindModulePage() {
    var $page = $(".module-page");
    if (!$page.length) return;

    var key = String($page.data("moduleKey") || "").trim();
    if (!key) return;

    var statusMap = {};
    try {
      statusMap = JSON.parse(String($page.attr("data-status-map") || "{}"));
    } catch (e) {
      statusMap = {};
    }

    var seed = [];
    try {
      seed = JSON.parse(String($page.attr("data-seed") || "[]"));
      if (!Array.isArray(seed)) seed = [];
    } catch (e) {
      seed = [];
    }

    var storeKey = MODULE_PREFIX + key;
    var $tbody = $("#module-list");
    if (!$tbody.length) return;

    function load() {
      try {
        var raw = localStorage.getItem(storeKey);
        if (!raw) return seed.slice();
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : seed.slice();
      } catch (e) {
        return seed.slice();
      }
    }

    function save(rows) {
      localStorage.setItem(storeKey, JSON.stringify(rows || []));
    }

    function normalizeStatus(v) {
      var s = String(v || "all");
      return statusMap[s] ? s : "all";
    }

    function statusLabel(v) {
      var code = normalizeStatus(v);
      return statusMap[code] || statusMap.all || "전체";
    }

    function statusColor(v) {
      var code = normalizeStatus(v);
      if (code === "done" || code === "2" || code === "3") return "#eb9316";
      if (code === "progress" || code === "1") return "#337ab7";
      return "#777";
    }

    function render() {
      var rows = load();
      var q = ($("#module-search").val() || "").trim();
      var s = ($("#module-status").val() || "all").trim();
      var status = normalizeStatus(s);

      var filtered = rows.filter(function (x) {
        var ok = true;
        if (status !== "all") ok = ok && normalizeStatus(x.status) === status;
        if (q) ok = ok && String(x.title || "").indexOf(q) > -1;
        return ok;
      });

      $tbody.empty();
      if (!filtered.length) {
        $tbody.append(
          '<tr><td colspan="5" class="text-center text-muted">검색 결과가 없습니다.</td></tr>',
        );
        return;
      }

      filtered.forEach(function (x, idx) {
        $tbody.append(
          "<tr>" +
            "<td>" +
            (idx + 1) +
            "</td>" +
            '<td class="text-left">' +
            (x.title || "") +
            "</td>" +
            "<td>" +
            (x.date || "") +
            "</td>" +
            '<td><span style="color:' +
            statusColor(x.status) +
            ';">' +
            statusLabel(x.status) +
            "</span></td>" +
            "<td>" +
            (x.note || "-") +
            "</td>" +
            "</tr>",
        );
      });
    }

    $("#btn-module-search").on("click", render);
    $("#module-status").on("change", render);
    $("#btn-module-reset").on("click", function () {
      $("#module-status").val("all");
      $("#module-search").val("");
      render();
    });
    $("#btn-module-add").on("click", function () {
      var title = ($("#module-title").val() || "").trim();
      if (!title) return notify("제목을 입력해 주세요.");

      var status = normalizeStatus($("#module-status").val() || "all");
      if (status === "all")
        status =
          Object.keys(statusMap).filter(function (k) {
            return k !== "all";
          })[0] || "all";

      var rows = load();
      rows.unshift({
        title: title,
        date: new Date().toISOString().slice(0, 10),
        status: status,
        note: "-",
      });
      save(rows);
      $("#module-title").val("");
      render();
    });

    render();
  }

  function bindWritePage() {
    if (!$("#fm_edit").length) return;
    if (!$("#lec_name").length) return;

    $("#fm_edit").on("submit", function (e) {
      e.preventDefault();

      var lecName = ($("#lec_name").val() || "").trim();
      var lecDiv = ($("#lec_div option:selected").text() || "").trim();
      var lecProType = ($("#lec_pro_type option:selected").text() || "").trim();
      var teaId = ($("#tea_id").val() || "").trim();
      var lecTime = ($("#lec_time").val() || "").trim();
      var lecTimeDisplay = ($("#lec_time_").val() || lecTime).trim();

      if (!lecName) return notify("강좌명을 입력해 주세요.");
      if (!lecDiv || lecDiv.indexOf("선택") > -1)
        return notify("강좌구분을 선택해 주세요.");
      if (!lecProType || lecProType.indexOf("선택") > -1)
        return notify("늘봄과정을 선택해 주세요.");
      if (!teaId) return notify("강사ID를 입력해 주세요.");
      if (!lecTime) return notify("강의시간을 선택해 주세요.");

      var list = loadStore();
      var id = nextId(list);
      list.push({
        id: id,
        div: lecDiv,
        proType: lecProType,
        name: lecName,
        teacherId: teaId,
        applied: 0,
        capacity: 0,
        waitApplied: 0,
        waitCapacity: 0,
        grades: "1,2,3,4,5,6",
        periodStart: "",
        periodEnd: "",
        lectureTime: lecTimeDisplay,
        fee: 0,
        feeVisible: "Y",
        teacherClosed: "-",
        refundClosed: "-",
        status: 1,
      });
      saveStore(list);

      localStorage.setItem(
        "last_lecture_write",
        JSON.stringify({
          lec_name: lecName,
          lec_div: lecDiv,
          lec_pro_type: lecProType,
          tea_id: teaId,
          lec_time: lecTime,
          at: new Date().toISOString(),
        }),
      );

      notify("강좌 등록이 완료되었습니다.");
      window.location.href = "index.html";
    });
  }

  function bindSurveySampleWritePage() {
    if (!$("body").hasClass("page-survey-sample-write")) return;
    if (!$("#fm_edit").length) return;

    var storageKey = "dbdb_module_survey_sample_writes";

    $("#btn-survey-sample-cancel").on("click", function () {
      window.location.href = "./survey-sample.html";
    });

    $("#fm_edit").on("submit", function (e) {
      e.preventDefault();

      var title = ($("#sur_title").val() || "").trim();
      var type = $('input[name="sur_type"]:checked').val() || "";
      var content = ($("#sur_content").val() || "").trim();

      if (!title) return notify("제목 : 필수 항목입니다.");
      if (!type) return notify("설문구분 : 필수 항목입니다.");

      var rows = [];
      try {
        rows = JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch (_) {
        rows = [];
      }
      rows.unshift({
        title: title,
        type: type,
        content: content,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(storageKey, JSON.stringify(rows));

      notify("샘플설문이 등록되었습니다.");
      setTimeout(function () {
        window.location.href = "./survey-sample.html";
      }, 120);
    });
  }

  function bindManualPage() {
    if (!$(".manual-page").length) return;
    var STORAGE_KEY = MODULE_PREFIX + "manual_resources";
    var $page = $(".manual-page");

    function textValue($el) {
      return String($el.first().text() || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function toKey(text, fallback) {
      var base = String(text || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u3131-\u318e\uac00-\ud7a3-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      return base || fallback;
    }

    function loadManualResources() {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("manual resource load failed", error);
        return [];
      }
    }

    function saveManualResources(items) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function getSections() {
      return $page
        .find(".faq_box")
        .map(function (index, box) {
          var $box = $(box);
          var title = textValue($box.find(".fq_title span"));
          if (!title) title = "섹션 " + (index + 1);
          var key = toKey(title, "manual-section-" + index);
          $box.attr("data-manual-section", key);
          return {
            key: key,
            title: title,
            $box: $box,
          };
        })
        .get();
    }

    function buttonHtml(url, label, iconClass) {
      if (!url) return "";
      return (
        '<a href="' +
        url +
        '" class="manual_btn" target="_blank" rel="noopener noreferrer"><i class="fa ' +
        iconClass +
        '"> ' +
        label +
        "</i></a>"
      );
    }

    function renderManualResources() {
      var resources = loadManualResources();
      var sections = getSections();
      $page.find(".manual-admin-list-wrap").remove();

      sections.forEach(function (section) {
        var items = resources.filter(function (item) {
          return item.sectionKey === section.key;
        });
        if (!items.length) return;

        var html = [
          '<div class="manual-admin-list-wrap"><p class="manual-admin-title">관리자 추가 자료</p><ul class="manual-admin-list">',
        ];
        items.forEach(function (item) {
          html.push('<li data-manual-resource-id="' + item.id + '">');
          html.push(
            '<div class="manual-admin-item-title">' +
              escapeHtml(item.title || "자료") +
              "</div>",
          );
          if (item.note) {
            html.push(
              '<div class="manual-admin-item-note">' +
                escapeHtml(item.note) +
                "</div>",
            );
          }
          html.push('<div class="manual-admin-item-actions">');
          html.push(buttonHtml(item.docUrl, "문서", "fa-download"));
          html.push(buttonHtml(item.videoUrl, "동영상", "fa-youtube-play"));
          html.push(
            '<button type="button" class="manual_btn manual-admin-remove" data-remove-manual-resource="' +
              item.id +
              '"><i class="fa fa-trash-o"> 삭제</i></button>',
          );
          html.push("</div></li>");
        });
        html.push("</ul></div>");
        section.$box.append(html.join(""));
      });

      $("#manual-admin-count").text(resources.length);
    }

    function renderAdminPanel() {
      if ($page.find("#manual-admin-panel").length) return;
      var sections = getSections();
      var options = sections
        .map(function (section) {
          return (
            '<option value="' +
            section.key +
            '">' +
            escapeHtml(section.title) +
            "</option>"
          );
        })
        .join("");

      var html = [
        '<div id="manual-admin-panel" class="panel_main panel-default_main manual-admin-panel">',
        '  <div class="panel-heading">자료 관리</div>',
        '  <div class="panel-body">',
        '    <div class="manual-admin-summary">',
        "      <h4>문서·동영상 관리자</h4>",
        "      <p>섹션을 선택한 뒤 문서 링크나 동영상 링크를 추가하면 현재 매뉴얼 화면에 바로 붙습니다. 브라우저에 저장되어 새로고침 후에도 유지됩니다.</p>",
        '      <div class="manual-admin-meta">',
        '        <span class="manual-admin-chip"><i class="fa fa-folder-open"></i> 전체 섹션 ' +
          sections.length +
          "개</span>",
        '        <span class="manual-admin-chip"><i class="fa fa-paperclip"></i> 추가 자료 <span id="manual-admin-count">0</span>개</span>',
        "      </div>",
        "    </div>",
        '    <form id="manual-admin-form" class="manual-admin-form">',
        '      <select id="manual-admin-section" class="form-control">' +
          options +
          "</select>",
        '      <input id="manual-admin-title" type="text" class="form-control" placeholder="자료 제목을 입력하세요.">',
        '      <div class="manual-admin-grid">',
        '        <input id="manual-admin-doc-url" type="url" class="form-control" placeholder="문서 URL (선택)">',
        '        <input id="manual-admin-video-url" type="url" class="form-control" placeholder="동영상 URL (선택)">',
        "      </div>",
        '      <textarea id="manual-admin-note" class="form-control" rows="3" placeholder="운영 메모나 안내 문구를 남길 수 있습니다."></textarea>',
        '      <div class="manual-admin-actions">',
        '        <div class="manual-admin-help">문서 또는 동영상 링크 중 하나 이상을 넣어야 합니다. 삭제는 각 항목의 삭제 버튼으로 할 수 있습니다.</div>',
        '        <div class="btn-group">',
        '          <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-plus"></i> 자료 추가</button>',
        '          <button type="button" id="manual-admin-reset" class="btn btn-default btn-sm">입력 초기화</button>',
        '          <button type="button" id="manual-admin-clear" class="btn btn-danger btn-sm">전체 삭제</button>',
        "        </div>",
        "      </div>",
        '      <div id="manual-admin-status" class="manual-admin-status info"></div>',
        "    </form>",
        "  </div>",
        "</div>",
      ].join("");

      $page.children(".panel_main").first().before(html);
    }

    function setStatus(type, message) {
      var $status = $("#manual-admin-status");
      $status
        .removeClass("info error is-visible")
        .addClass(type + " is-visible")
        .text(message);
    }

    function resetForm() {
      $(
        "#manual-admin-title, #manual-admin-doc-url, #manual-admin-video-url, #manual-admin-note",
      ).val("");
      $("#manual-admin-section").prop("selectedIndex", 0);
    }

    renderAdminPanel();
    renderManualResources();

    $(".manual_btn").each(function () {
      var $a = $(this);
      var href = String($a.attr("href") || "").trim();
      if (href && href.indexOf("http") === 0 && !$a.attr("target")) {
        $a.attr("target", "_blank");
        $a.attr("rel", "noopener noreferrer");
      }
    });

    $("#manual-admin-form").on("submit", function (event) {
      event.preventDefault();
      var title = String($("#manual-admin-title").val() || "").trim();
      var sectionKey = String($("#manual-admin-section").val() || "").trim();
      var docUrl = String($("#manual-admin-doc-url").val() || "").trim();
      var videoUrl = String($("#manual-admin-video-url").val() || "").trim();
      var note = String($("#manual-admin-note").val() || "").trim();

      if (!title) {
        setStatus("error", "자료 제목을 먼저 입력해 주세요.");
        $("#manual-admin-title").trigger("focus");
        return;
      }

      if (!docUrl && !videoUrl) {
        setStatus(
          "error",
          "문서 URL 또는 동영상 URL 중 하나는 입력해야 합니다.",
        );
        $("#manual-admin-doc-url").trigger("focus");
        return;
      }

      var items = loadManualResources();
      items.push({
        id: "manual_" + Date.now(),
        sectionKey: sectionKey,
        title: title,
        docUrl: docUrl,
        videoUrl: videoUrl,
        note: note,
      });
      saveManualResources(items);
      renderManualResources();
      resetForm();
      setStatus("info", "선택한 섹션에 자료가 추가되었습니다.");
    });

    $(document).on("click", "[data-remove-manual-resource]", function () {
      var id = String($(this).data("remove-manual-resource") || "");
      var items = loadManualResources().filter(function (item) {
        return item.id !== id;
      });
      saveManualResources(items);
      renderManualResources();
      setStatus("info", "자료를 삭제했습니다.");
    });

    $("#manual-admin-reset").on("click", function () {
      resetForm();
      setStatus("info", "입력 내용을 초기화했습니다.");
    });

    $("#manual-admin-clear").on("click", function () {
      if (!window.confirm("추가한 관리자 자료를 모두 삭제할까요?")) return;
      saveManualResources([]);
      renderManualResources();
      setStatus("info", "추가한 관리자 자료를 모두 삭제했습니다.");
    });
  }

  function bindAttendancePage() {
    if (!$("#fm_attendance").length) return;

    var $listWrap = $("#att_lecture_list");
    var $div = $("#att_div");
    var $pro = $("#att_pro_type");
    var $all = $("#att_check_all");
    var sourceRows = [];
    var $lecError = $("#att_lecture_error");

    function intVal(selector) {
      var v = String($(selector).val() || "").replace(/[^\d]/g, "");
      return Number(v) || 0;
    }

    function ensureSourceRows() {
      var storeRows = loadStore();
      if (!storeRows.length) {
        storeRows = [
          {
            id: 1,
            div: "3월",
            proType: "돌봄",
            name: "기본 출석부 강좌",
            teacherId: "teacher01",
            periodStart: "",
            periodEnd: "",
            lectureTime: "월 3-4교시",
          },
        ];
      }
      sourceRows = storeRows.slice();
    }

    function getRows() {
      ensureSourceRows();
      var div = String($div.val() || "").trim();
      var pro = String($pro.val() || "").trim();
      if (!div) return [];
      return sourceRows.filter(function (lec) {
        var ok = true;
        if (div) ok = ok && String(lec.div || "") === div;
        if (pro) ok = ok && String(lec.proType || "") === pro;
        return ok;
      });
    }

    function renderList() {
      $lecError.text("");
      var rows = getRows();
      $listWrap.empty();
      if (!rows.length) {
        if (!String($div.val() || "").trim()) {
          $listWrap.html(
            '<div class="text-muted">강좌구분을 선택해 주세요.</div>',
          );
        } else {
          $listWrap.html(
            '<div class="text-muted">선택 가능한 강좌가 없습니다.</div>',
          );
        }
        $all.prop("checked", false).prop("indeterminate", false);
        return;
      }

      var html = ['<ul class="att-lecture-items">'];
      rows.forEach(function (lec) {
        var label =
          "[" +
          (lec.div || "-") +
          "] [" +
          (lec.proType || "-") +
          "] " +
          (lec.name || "-");
        html.push(
          '<li><label><input type="checkbox" class="att-lec" value="' +
            (lec.id || "") +
            '" checked> ' +
            label +
            "</label></li>",
        );
      });
      html.push("</ul>");
      $listWrap.html(html.join(""));
      $all.prop("checked", true);
      $all.prop("indeterminate", false);
    }

    function buildAttendanceCsv(selected, opts) {
      var lines = [];
      var dayCount =
        opts.printDirection === "H" ? opts.colCountH : opts.colCountV;
      if (dayCount < 3) dayCount = 3;
      if (dayCount > 31) dayCount = 31;
      var header = [
        '"강좌번호"',
        '"강좌명"',
        '"강사ID"',
        '"운영기간"',
        '"강의시간"',
      ];
      for (var i = 1; i <= dayCount; i += 1) {
        header.push('"출석' + i + '"');
      }
      if (opts.viewHp === "2") header.push('"연락처"');
      lines.push(header.join(","));
      selected.forEach(function (lec) {
        var row = [
          escapeCsv(lec.id),
          escapeCsv(lec.name),
          escapeCsv(lec.teacherId),
          escapeCsv((lec.periodStart || "") + "~" + (lec.periodEnd || "")),
          escapeCsv(lec.lectureTime || ""),
        ];
        for (var j = 1; j <= dayCount; j += 1) row.push('""');
        if (opts.viewHp === "2") row.push('""');
        lines.push(row.join(","));
      });
      return lines;
    }

    function applyPrintDirectionStyle() {
      var dir = $("input[name='op_pr_dir']:checked").val() || "V";
      var isVertical = dir === "V";
      $(
        "#op_col_cnt_h, #op_col_width_h, #op_row_cnt_h, #op_row_height_h",
      ).toggleClass("att-highlight", !isVertical);
      $(
        "#op_col_cnt_v, #op_col_width_v, #op_row_cnt_v, #op_row_height_v",
      ).toggleClass("att-highlight", isVertical);
    }

    $div.on("change", renderList);
    $pro.on("change", renderList);
    $("input[name='op_pr_dir']").on("change", applyPrintDirectionStyle);
    $(
      "#op_col_cnt_h, #op_col_width_h, #op_col_cnt_v, #op_col_width_v, #op_row_cnt_h, #op_row_height_h, #op_row_cnt_v, #op_row_height_v",
    ).on("input", function () {
      this.value = String(this.value || "").replace(/[^\d]/g, "");
    });

    $all.on("change", function () {
      $(".att-lec").prop("checked", this.checked);
    });

    $(document).on("change", ".att-lec", function () {
      var total = $(".att-lec").length;
      var checked = $(".att-lec:checked").length;
      $all.prop("checked", total > 0 && total === checked);
      $all.prop("indeterminate", checked > 0 && checked < total);
    });

    $("#fm_attendance").on("submit", function (e) {
      e.preventDefault();
      var lecDiv = String($div.val() || "").trim();
      if (!lecDiv) {
        notify("강좌구분 : 선택해 주세요.");
        return;
      }

      var ids = $(".att-lec:checked")
        .map(function () {
          return Number(this.value) || 0;
        })
        .get()
        .filter(Boolean);
      if (!ids.length) {
        $lecError.text("강좌를 선택해 주세요.");
        return notify("강좌 : 선택해 주세요.");
      }
      $lecError.text("");

      var colCntH = intVal("#op_col_cnt_h");
      var colCntV = intVal("#op_col_cnt_v");
      var rowCntH = intVal("#op_row_cnt_h");
      var rowCntV = intVal("#op_row_cnt_v");
      if (colCntH < 3)
        return notify("수업 일수(가로 인쇄) : 최소 3칸 이상입니다.");
      if (colCntV < 3)
        return notify("수업 일수(세로 인쇄) : 최소 3칸 이상입니다.");
      if (rowCntH < 3)
        return notify("학생 명단(가로 인쇄) : 최소 3칸 이상입니다.");
      if (rowCntV < 3)
        return notify("학생 명단(세로 인쇄) : 최소 3칸 이상입니다.");

      var list = sourceRows.filter(function (lec) {
        return ids.indexOf(Number(lec.id)) > -1;
      });
      if (!list.length) return notify("출력할 데이터가 없습니다.");

      if (
        !window.confirm(
          "출력하시겠습니까?\n\n(데이터가 많은 경우 처리되는 시간이 다소 지연될 수 있습니다.)",
        )
      )
        return;
      var opts = {
        viewHp: String($("input[name='op_view_hp']:checked").val() || "1"),
        printDirection: String(
          $("input[name='op_pr_dir']:checked").val() || "V",
        ),
        colCountH: colCntH,
        colCountV: colCntV,
      };
      var lines = buildAttendanceCsv(list, opts);
      downloadCsv("attendance-sheet-" + nowStamp() + ".csv", lines);
    });

    applyPrintDirectionStyle();
    renderList();
  }

  function bindApplicantsPage() {
    if (String($("body").data("sidebar-page") || "") !== "applicants") return;
    var $table = $(".module-raw-content table").first();
    if (!$table.length) return;
    var $lecSel = $("#sel_lec_num");

    if ($lecSel.length) {
      var options = [];
      $table.find("tbody tr").each(function () {
        var text = String($(this).find("td.text-left").first().text() || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!text) return;
        if (options.indexOf(text) < 0) options.push(text);
      });
      if (options.length) {
        var html = ['<option value="">=강좌전체=</option>'];
        options.forEach(function (text, idx) {
          html.push('<option value="' + (idx + 1) + '">' + text + "</option>");
        });
        $lecSel.html(html.join(""));
      }
    }

    (function normalizeApplicantsTableText() {
      var processMap = {
        lec_pro_type1: "방과후",
        lec_pro_type2: "맞춤형",
        lec_pro_type3: "돌봄",
      };
      $table.find("tbody tr").each(function (idx) {
        var $tr = $(this);
        var $td = $tr.find("td");
        if ($td.length < 10) return;

        var $catCell = $td.eq(2);
        var catRaw = String($catCell.text() || "");
        if (/\?/.test(catRaw)) {
          var mm = catRaw.match(/(\d{1,2})\?\?/);
          var monthLabel = mm ? mm[1] + "월" : "2월";
          var processLabel = "돌봄";
          Object.keys(processMap).forEach(function (cls) {
            if ($catCell.find("." + cls).length) processLabel = processMap[cls];
          });
          $catCell.html(monthLabel + "<br><span>" + processLabel + "</span>");
        }

        var $lecCell = $td.eq(3);
        var lecText = String($lecCell.text() || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!lecText || /\?/.test(lecText)) {
          var rowNo = String($td.eq(1).text() || "").trim() || String(idx + 1);
          $lecCell.text("[강좌] 신청 강좌 " + rowNo);
        }

        var $nameCell = $td.eq(7);
        var nameText = String($nameCell.text() || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!nameText || /\?/.test(nameText)) {
          var fixedName = "학생" + (idx + 1);
          var $nameLink = $nameCell.find("a.link_type").first();
          if ($nameLink.length) $nameLink.text(fixedName);
          $nameCell
            .find("a")
            .not($nameLink)
            .each(function () {
              var $a = $(this);
              if (!$a.find("i").length) $a.text("");
            });
          $nameCell
            .contents()
            .filter(function () {
              return this.nodeType === 3;
            })
            .remove();
          if (!$nameLink.length) $nameCell.prepend(fixedName);
        }

        var $phoneCell = $td.eq(8);
        var phoneText = String($phoneCell.text() || "");
        var phoneMatch = phoneText.match(/\b01\d-\d{3,4}-\d{4}\b/);
        if (!phoneMatch) {
          var hiddenVal = String(
            $phoneCell.find("input[type='hidden']").val() || "",
          );
          phoneMatch = hiddenVal.match(/\b01\d-\d{3,4}-\d{4}\b/);
        }
        if (!phoneMatch) {
          $phoneCell.find("span").first().text("-");
        } else {
          $phoneCell.find("span").first().text(phoneMatch[0]);
        }
      });
    })();

    function downloadApplicantsCsv(prefix) {
      var lines = readTableAsCsvLines($table, "tbody tr:visible");
      if (lines.length <= 1) {
        notify("내보낼 신청 데이터가 없습니다.");
        return false;
      }
      downloadCsv(prefix + "-" + nowStamp() + ".csv", lines);
      return true;
    }

    function visibleRows() {
      return $table.find("tbody tr:visible").filter(function () {
        return $(this).find("td").length > 0;
      });
    }

    function addApplicantRow(data) {
      var $rows = $table.find("tbody tr").filter(function () {
        return $(this).find("td").length > 0;
      });
      var nextNo = $rows.length
        ? Number($rows.first().find("td:eq(1)").text()) + 1
        : 1;
      var rowNo = String(nextNo || 1);
      var today = new Date().toISOString().slice(0, 10);
      var html = [
        "<tr>",
        '<td><input type="checkbox" name="data_checked[]" value="' +
          Date.now() +
          '"></td>',
        "<td>" + rowNo + "</td>",
        '<td>2월<br><span class="lec_pro_type3">돌봄</span></td>',
        '<td class="text-left">[강좌] ' +
          (data.lecture || "신청 강좌 " + rowNo) +
          "</td>",
        "<td>" + (data.grade || "2") + "</td>",
        "<td>" + (data.classNo || "1") + "</td>",
        "<td>" + (data.stuNo || "1") + "</td>",
        '<td style="position:relative;"><a href="#" class="link_type">' +
          (data.name || "학생" + rowNo) +
          '</a> <a href="#none;"><i class="fa fa-list-alt"></i></a></td>',
        '<td style="position:relative;"><span>' +
          (data.phone || "-") +
          '</span> <a href="#none;"><i class="fa fa-pencil-square"></i></a></td>',
        "<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>",
        "<td>" + today + "<br>09:00:00</td>",
        '<td><a href="#none;" class="del-link"><i class="fa fa-trash-o icon_btn"></i></a></td>',
        "</tr>",
      ].join("");
      $table.find("tbody").prepend(html);
    }

    function downloadApplicantsPrint(kind) {
      var rows = visibleRows();
      if (!rows.length) {
        notify("출력할 신청 데이터가 없습니다.");
        return;
      }
      var lines = [kind + " 출력", "생성시각," + new Date().toISOString()];
      rows.each(function () {
        var $td = $(this).find("td");
        lines.push(
          [
            ($td.eq(1).text() || "").trim(),
            ($td.eq(3).text() || "").replace(/\s+/g, " ").trim(),
            ($td.eq(7).text() || "").replace(/\s+/g, " ").trim(),
            ($td.eq(8).text() || "").replace(/\s+/g, " ").trim(),
          ].join(","),
        );
      });
      downloadText(
        "applicants-" + kind + "-" + nowStamp() + ".txt",
        lines.join("\n"),
      );
    }

    function handleApplicantsAction(actionKey) {
      if (actionKey === "sin") {
        var name = String(
          window.prompt("학생 이름을 입력해 주세요.", "신규학생") || "",
        ).trim();
        if (!name) return;
        var phone = String(
          window.prompt("연락처를 입력해 주세요.", "010-0000-0000") || "",
        ).trim();
        addApplicantRow({ name: name, phone: phone });
        notify("신청자 등록이 완료되었습니다.");
        return;
      }
      if (actionKey === "input") {
        downloadText(
          "applicants-bulk-template-" + nowStamp() + ".csv",
          "이름,연락처,학년,반,강좌명\n홍길동,010-0000-0000,2,1,신청 강좌",
        );
        return;
      }
      if (actionKey === "copy") {
        var $checked = $(
          "#fm_list input[name='data_checked[]']:checked",
        ).closest("tr");
        if (!$checked.length) {
          notify("복사할 신청자를 선택해 주세요.");
          return;
        }
        $checked.each(function () {
          $(this).clone(true).insertAfter($(this));
        });
        notify("선택한 신청자를 복사했습니다.");
        return;
      }
      if (actionKey === "com") {
        notify("추가/취소 신청자 조회 화면은 로컬 데모로 제공됩니다.");
        return;
      }
      if (actionKey === "list1") {
        notify("미신청자 목록 화면은 로컬 데모로 제공됩니다.");
        return;
      }
      if (actionKey === "pdf") {
        downloadApplicantsPrint("신청서");
        return;
      }
      if (actionKey === "pdf1") {
        downloadApplicantsPrint("고지서");
        return;
      }
      if (actionKey === "pdf2") {
        downloadApplicantsPrint("시간표");
        return;
      }
      if (actionKey === "pay") {
        notify(
          "수강료 입력 화면은 로컬 데모에서 표 데이터 편집으로 대체됩니다.",
        );
      }
    }

    $(document).on("click", ".module-raw-content a[href]", function (e) {
      var href = String($(this).attr("href") || "").trim();
      if (!href) return;
      if (
        /\/af\/ad_app\/listse\//i.test(href) ||
        /applicants\.html\?download=search/i.test(href)
      ) {
        e.preventDefault();
        downloadApplicantsCsv("applicants-search-result");
        return;
      }
      if (
        /\/af\/ad_app\/excel\//i.test(href) ||
        /applicants\.html\?download=all/i.test(href)
      ) {
        e.preventDefault();
        downloadApplicantsCsv("applicants-result");
        return;
      }
      if (
        /\/af\/ad_app\/(sin|input|copy|com|list1|pdf|pdf1|pdf2)\//i.test(
          href,
        ) ||
        /\/af\/ad_pay\/edit\//i.test(href)
      ) {
        e.preventDefault();
        var mapped = mapDbdbUrlToLocal(href);
        if (mapped) {
          window.location.href = mapped;
          return;
        }
        var m = href.match(
          /\/af\/ad_app\/(sin|input|copy|com|list1|pdf|pdf1|pdf2)\//i,
        );
        if (m && m[1]) handleApplicantsAction(String(m[1]).toLowerCase());
        else if (/\/af\/ad_pay\/edit\//i.test(href))
          handleApplicantsAction("pay");
      }
    });

    var params = getSearchParams();
    if (params) {
      var dl = String(params.get("download") || "").trim();
      if (dl === "search") downloadApplicantsCsv("applicants-search-result");
      if (dl === "all") downloadApplicantsCsv("applicants-result");
      var mode = String(params.get("mode") || "").trim();
      if (mode) {
        var modeHref =
          mode === "pay"
            ? "https://www.dbdbschool.kr/af/ad_pay/edit/p/1/sn/2848"
            : "https://www.dbdbschool.kr/af/ad_app/" + mode + "/p/1/sn/2848";
        var mappedMode = mapDbdbUrlToLocal(modeHref);
        if (mappedMode) window.location.href = mappedMode;
        else handleApplicantsAction(mode);
      }
      if (dl) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }

  function bindWaitlistPage() {
    if (String($("body").data("sidebar-page") || "") !== "wait") return;
    (function normalizeWaitSearchOptions() {
      var monthByValue = {
        all: "=강좌구분=",
        1: "3월",
        2: "4월",
        3: "5월",
        4: "6월",
        5: "7월",
        6: "8월",
        7: "9월",
        8: "10월",
        9: "11월",
        10: "12월",
        11: "1월",
        12: "2월",
        13: "2026년 3월",
      };
      var courseByValue = {
        all: "=늘봄과정=",
        1: "방과후",
        2: "맞춤형",
        3: "돌봄",
      };

      $("form[name='fm_list_search'] select[name='sld'] option").each(
        function () {
          var $opt = $(this);
          var value = String($opt.attr("value") || "").trim();
          var text = String($opt.text() || "").trim();
          if (/\?/.test(text) && monthByValue[value])
            $opt.text(monthByValue[value]);
        },
      );

      $("form[name='fm_list_search'] select[name='slp'] option").each(
        function () {
          var $opt = $(this);
          var value = String($opt.attr("value") || "").trim();
          var text = String($opt.text() || "").trim();
          if (/\?/.test(text) && courseByValue[value])
            $opt.text(courseByValue[value]);
        },
      );
    })();

    var $table = $(".module-raw-content table").first();
    if (!$table.length) return;

    (function normalizeWaitTableText() {
      $table.find("tbody tr").each(function (idx) {
        var $tr = $(this);
        var $td = $tr.find("td");
        if ($td.length < 10) return;

        var $catCell = $td.eq(3);
        var catText = String($catCell.text() || "");
        if (/\?/.test(catText)) $catCell.text("2월");

        var $lecCell = $td.eq(4);
        var lecText = String($lecCell.text() || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!lecText || /\?/.test(lecText)) {
          var rowNo = String($td.eq(1).text() || "").trim() || String(idx + 1);
          $lecCell.text("[대기] 신청 강좌 " + rowNo);
        }

        var $nameCell = $td.eq(8);
        var nameText = String($nameCell.text() || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!nameText || /\?/.test(nameText))
          $nameCell.text("학생" + (idx + 1));

        var $phoneCell = $td.eq(9);
        var phoneText = String($phoneCell.text() || "");
        var phone = phoneText.match(/\b01\d-\d{3,4}-\d{4}\b/);
        if (!phone) $phoneCell.text("-");
        else $phoneCell.text(phone[0]);

        var $applyBtn = $td.eq(2).find("button");
        if ($applyBtn.length) {
          var applyText = String($applyBtn.text() || "")
            .replace(/\s+/g, " ")
            .trim();
          if (!applyText || /\?/.test(applyText)) $applyBtn.text("신청");
        }
      });
    })();

    function visibleRows() {
      return $table.find("tbody tr:visible").filter(function () {
        return $(this).find("td").length > 0;
      });
    }

    function downloadWaitCsv(prefix) {
      var lines = readTableAsCsvLines($table, "tbody tr:visible");
      if (lines.length <= 1) {
        notify("내보낼 대기자 데이터가 없습니다.");
        return false;
      }
      downloadCsv(prefix + "-" + nowStamp() + ".csv", lines);
      return true;
    }

    function addWaitRow(data) {
      var $rows = visibleRows();
      var nextRank = $rows.length
        ? Number($rows.last().find("td:eq(1)").text()) + 1
        : 1;
      var nextNo = $rows.length
        ? Number($rows.first().find("td:eq(7)").text()) + 1
        : 1;
      var today = new Date().toISOString().slice(0, 10);
      var html = [
        "<tr>",
        '<td><input type="checkbox" name="data_checked[]" value="' +
          Date.now() +
          '"></td>',
        "<td>" + nextRank + "</td>",
        '<td><button type="button" class="btn btn-primary btn-sm btn-wait-apply">신청</button></td>',
        "<td>2월</td>",
        '<td class="text-left">[대기] ' +
          (data.lecture || "신청 강좌 " + nextRank) +
          "</td>",
        "<td>" + (data.grade || "2") + "</td>",
        "<td>" + (data.classNo || "1") + "</td>",
        "<td>" + nextNo + "</td>",
        "<td>" + (data.name || "학생" + nextRank) + "</td>",
        "<td>" + (data.phone || "-") + "</td>",
        "<td>" + today + "<br>09:00:00</td>",
        '<td><a href="#none;" class="del-link"><i class="fa fa-trash-o icon_btn"></i></a></td>',
        "</tr>",
      ].join("");
      $table.find("tbody").append(html);
    }

    function handleWaitAction(actionKey) {
      if (actionKey === "sin") {
        var name = String(
          window.prompt("대기자 이름을 입력해 주세요.", "신규대기자") || "",
        ).trim();
        if (!name) return;
        var phone = String(
          window.prompt("연락처를 입력해 주세요.", "010-0000-0000") || "",
        ).trim();
        addWaitRow({ name: name, phone: phone });
        notify("대기자 등록이 완료되었습니다.");
        return;
      }
      if (actionKey === "input") {
        downloadText(
          "waitlist-bulk-template-" + nowStamp() + ".csv",
          "이름,연락처,학년,반,강좌명\n홍길동,010-0000-0000,2,1,신청 강좌",
        );
        return;
      }
      if (actionKey === "copy") {
        var $checked = $(
          "#fm_list input[name='data_checked[]']:checked",
        ).closest("tr");
        if (!$checked.length) {
          notify("복사할 대기자를 선택해 주세요.");
          return;
        }
        $checked.each(function () {
          $(this).clone(true).insertAfter($(this));
        });
        notify("선택한 대기자를 복사했습니다.");
        return;
      }
      if (actionKey === "excel") {
        downloadWaitCsv("waitlist-result");
      }
    }

    $(document).on("click", ".module-raw-content .btn-wait-apply", function () {
      var $btn = $(this);
      var $tr = $btn.closest("tr");
      $btn
        .removeClass("btn-primary")
        .addClass("btn-default")
        .text("처리완료")
        .prop("disabled", true);
      $tr.addClass("wait-applied");
      notify("대기자 신청 처리가 완료되었습니다.");
    });

    $(document).on(
      "click",
      ".module-raw-content button[onclick*='chk_app(']",
      function (e) {
        e.preventDefault();
        $(this).removeAttr("onclick").addClass("btn-wait-apply").text("신청");
        $(this).trigger("click");
      },
    );

    $(document).on("click", ".module-raw-content a[href]", function (e) {
      var href = String($(this).attr("href") || "").trim();
      if (!href) return;
      if (
        /\/af\/ad_wait\/excel\//i.test(href) ||
        /waitlist\.html\?download=all/i.test(href)
      ) {
        e.preventDefault();
        downloadWaitCsv("waitlist-result");
        return;
      }
      if (/\/af\/ad_wait\/(sin|input|copy)\//i.test(href)) {
        e.preventDefault();
        var m = href.match(/\/af\/ad_wait\/(sin|input|copy)\//i);
        if (m && m[1]) handleWaitAction(String(m[1]).toLowerCase());
        return;
      }
    });

    var params = getSearchParams();
    if (params) {
      var dl = String(params.get("download") || "").trim();
      if (dl === "all") downloadWaitCsv("waitlist-result");
      var mode = String(params.get("mode") || "").trim();
      if (mode) handleWaitAction(mode);
      if (dl || mode)
        window.history.replaceState({}, "", window.location.pathname);
    }
  }

  function mapDbdbUrlToLocal(href) {
    if (!href) return "";
    var src = String(href).trim();
    if (!src) return "";

    var lower = src.toLowerCase();
    if (
      lower.indexOf("javascript:") === 0 ||
      lower.indexOf("mailto:") === 0 ||
      lower.indexOf("tel:") === 0 ||
      lower.indexOf("#") === 0
    ) {
      return "";
    }

    var url;
    try {
      url = new URL(src, window.location.href);
    } catch (e) {
      return "";
    }
    if (url.hostname.indexOf("dbdbschool.kr") < 0) return "";

    var p = url.pathname;
    var m = p.match(/^\/af\/ad_free2_stu\/modify\/num\/(\d+)\//);
    if (m && m[1]) return "./fund-targets.html?mode=modify&num=" + m[1];
    var mApp = p.match(/^\/af\/ad_free2_app\/modify\/num\/(\d+)\//);
    if (mApp && mApp[1]) return "./fund-apps.html?mode=modify&num=" + mApp[1];
    var routes = [
      { re: /^\/af\/ad_faq\/main\//, file: "./manual.html" },
      { re: /^\/af\/qanda\/lists\//, file: "./qanda.html" },
      { re: /^\/sczigi\/service\/lists\//, file: "./school.html" },
      { re: /^\/af\/ad_att\/excel\//, file: "./attendance.html" },
      { re: /^\/af\/ad_lec\/lists\//, file: "./index.html" },
      { re: /^\/af\/ad_app\/lists\//, file: "./applicants.html" },
      {
        re: /^\/af\/ad_app\/listse\//,
        file: "./applicants.html?download=search",
      },
      { re: /^\/af\/ad_app\/excel\//, file: "./applicants.html?download=all" },
      {
        re: /^\/af\/ad_app\/sin\//,
        file: "./applicants-subpage.html?kind=sin",
      },
      {
        re: /^\/af\/ad_app\/input\//,
        file: "./applicants-subpage.html?kind=input",
      },
      {
        re: /^\/af\/ad_app\/copy\//,
        file: "./applicants-subpage.html?kind=copy",
      },
      {
        re: /^\/af\/ad_app\/com\//,
        file: "./applicants-subpage.html?kind=com",
      },
      {
        re: /^\/af\/ad_app\/list1\//,
        file: "./applicants-subpage.html?kind=list1",
      },
      {
        re: /^\/af\/ad_app\/pdf\//,
        file: "./applicants-subpage.html?kind=pdf",
      },
      {
        re: /^\/af\/ad_app\/pdf1\//,
        file: "./applicants-subpage.html?kind=pdf1",
      },
      {
        re: /^\/af\/ad_app\/pdf2\//,
        file: "./applicants-subpage.html?kind=pdf2",
      },
      {
        re: /^\/af\/ad_pay\/edit\//,
        file: "./applicants-subpage.html?kind=pay",
      },
      { re: /^\/af\/ad_wait\/lists\//, file: "./waitlist.html" },
      { re: /^\/af\/ad_wait\/excel\//, file: "./waitlist.html?download=all" },
      { re: /^\/af\/ad_wait\/sin\//, file: "./waitlist.html?mode=sin" },
      { re: /^\/af\/ad_wait\/input\//, file: "./waitlist.html?mode=input" },
      { re: /^\/af\/ad_wait\/copy\//, file: "./waitlist.html?mode=copy" },
      { re: /^\/af\/ad_refund\/lists\//, file: "./refund.html" },
      { re: /^\/af\/ad_free2_stu\/lists\//, file: "./fund-targets.html" },
      {
        re: /^\/af\/ad_free2_stu\/write\//,
        file: "./fund-targets.html?mode=write",
      },
      {
        re: /^\/af\/ad_free2_stu\/input\//,
        file: "./fund-targets.html?mode=input",
      },
      {
        re: /^\/af\/ad_free2_stu\/listse1\//,
        file: "./fund-targets.html?download=all",
      },
      {
        re: /^\/af\/ad_free2_stu\/listse\//,
        file: "./fund-targets.html?download=search",
      },
      { re: /^\/af\/ad_free2_stu\/del\//, file: "./fund-targets.html" },
      { re: /^\/af\/ad_free2_app\/lists\//, file: "./fund-apps.html" },
      {
        re: /^\/af\/ad_free2_app\/write\//,
        file: "./fund-apps.html?mode=write",
      },
      {
        re: /^\/af\/ad_free2_app\/apply\//,
        file: "./fund-apps.html?mode=apply",
      },
      {
        re: /^\/af\/ad_free2_app\/listse\//,
        file: "./fund-apps.html?download=search",
      },
      {
        re: /^\/af\/ad_free2_app\/excel6\//,
        file: "./fund-apps.html?download=all_collect",
      },
      {
        re: /^\/af\/ad_free2_appe\/excel2\//,
        file: "./fund-apps.html?download=month",
      },
      {
        re: /^\/af\/ad_free2_appe\/excel3\//,
        file: "./fund-apps.html?download=bank",
      },
      {
        re: /^\/af\/ad_free2_appe\/excel4\//,
        file: "./fund-apps.html?download=admin",
      },
      {
        re: /^\/af\/ad_free2_appe\/excel5\//,
        file: "./fund-apps.html?download=neis",
      },
      {
        re: /^\/af\/ad_free2_app\/free_month\//,
        file: "./fund-apps.html?mode=free_month",
      },
      { re: /^\/af\/ad_free2_app\/del\//, file: "./fund-apps.html" },
      { re: /^\/af\/ad_free2_cfg\/main\//, file: "./fund-config.html" },
      {
        re: /^\/af\/ad_free2_cfg\/sorts\//,
        file: "./popups/fund-config-sorts.html",
      },
      { re: /^\/af\/ad_free2_cfg\/free\d+\//, file: "./fund-rank.html" },
      { re: /^\/af\/ad_fund\/target/, file: "./fund-targets.html" },
      { re: /^\/af\/ad_fund\/app/, file: "./fund-apps.html" },
      { re: /^\/af\/ad_fund\/config/, file: "./fund-config.html" },
      { re: /^\/af\/ad_fund\/rank/, file: "./fund-rank.html" },
      { re: /^\/af\/ad_tea\/lists\//, file: "./teacher.html" },
      { re: /^\/af\/ad_tea\/write\//, file: "./teacher.html?mode=write" },
      { re: /^\/af\/ad_tea\/input\//, file: "./teacher.html?mode=input" },
      { re: /^\/af\/ad_tea\/listse\//, file: "./teacher.html?download=search" },
      {
        re: /^\/af\/ad_tea\/schedule\//,
        file: "./teacher.html?download=schedule",
      },
      { re: /^\/af\/ad_tea\/modify\/num\/(\d+)\//, file: "./teacher.html" },
      { re: /^\/af\/ad_tea\/del\//, file: "./teacher.html" },
      { re: /^\/af\/ad_survey\/lists\//, file: "./survey.html" },
      { re: /^\/af\/ad_survey\/sample\//, file: "./survey-sample.html" },
      { re: /^\/af\/ad_surs\/write\//, file: "./survey-sample-write.html" },
      { re: /^\/af\/ad_surs\/modify\//, file: "./survey-sample-write.html" },
      { re: /^\/af\/ad_cfg\/basic\//, file: "./cfg-basic.html" },
      { re: /^\/af\/ad_cfg\/period\//, file: "./cfg-period.html" },
      { re: /^\/af\/ad_cfg\/lecture_time\//, file: "./cfg-lecture-time.html" },
      { re: /^\/af\/ad_cfg\/division\//, file: "./cfg-division.html" },
      { re: /^\/af\/ad_cfg\/group\//, file: "./cfg-group.html" },
      { re: /^\/af\/ad_cfg\/verify\//, file: "./cfg-verify.html" },
      { re: /^\/af\/ad_cfg\/neis\//, file: "./cfg-neis.html" },
      { re: /^\/af\/notification\/lists\//, file: "./notification.html" },
      { re: /^\/sczigi\/teacher\/lists\//, file: "./school-teacher.html" },
      {
        re: /^\/sczigi\/teacher\/field\//,
        file: "./school-teacher-field.html",
      },
      {
        re: /^\/sczigi\/teacher\/level\//,
        file: "./school-teacher-level.html",
      },
      {
        re: /^\/sczigi\/teacher\/clear\//,
        file: "./school-teacher-clear.html",
      },
      { re: /^\/sczigi\/student\/lists\//, file: "./school-student.html" },
      { re: /^\/sczigi\/student\/main\//, file: "./school-student-main.html" },
      {
        re: /^\/sczigi\/student\/field\//,
        file: "./school-student-field.html",
      },
      {
        re: /^\/sczigi\/student\/course\//,
        file: "./school-student-course.html",
      },
      {
        re: /^\/sczigi\/student\/clear\//,
        file: "./school-student-clear.html",
      },
      { re: /^\/sczigi\/sms\/tel\//, file: "./school-sms-tel.html" },
      { re: /^\/sczigi\/sms\/sin\//, file: "./school-sms-sin.html" },
      { re: /^\/sczigi\/sms\/charge\//, file: "./school-sms-charge.html" },
      { re: /^\/sczigi\/sms\/report\//, file: "./school-sms-report.html" },
    ];

    for (var i = 0; i < routes.length; i += 1) {
      if (routes[i].re.test(p)) return routes[i].file;
    }
    return "";
  }

  function bindRawClonePages() {
    var $scope = $(".module-raw-content, .school-raw-content");
    if (!$scope.length) return;

    function normalizeText(s) {
      return String(s || "")
        .replace(/\s+/g, " ")
        .replace(/[=\[\]]/g, "")
        .trim()
        .toLowerCase();
    }

    function parseDateYmd(s) {
      var m = String(s || "").match(/\b(\d{4})[-./](\d{2})[-./](\d{2})\b/);
      return m ? m[1] + "-" + m[2] + "-" + m[3] : "";
    }

    function filterRowsByForm($form) {
      var $container = $form.closest(".panel_main");
      if (!$container.length) $container = $scope.first();

      var $table = $container.find("table").first();
      var $rows = $table.find("tbody tr").filter(function () {
        return $(this).find("td").length > 0;
      });
      if (!$rows.length) return;

      var keyword = normalizeText(
        $form.find('input[name="sw"], #s_word').first().val() || "",
      );
      var sdate = String($form.find('input[name="sdate"]').val() || "").trim();
      var edate = String($form.find('input[name="edate"]').val() || "").trim();

      var selectChecks = [];
      $form.find("select").each(function () {
        var $sel = $(this);
        var val = String($sel.val() || "").trim();
        if (!val || val === "all") return;
        var text = normalizeText($sel.find("option:selected").text());
        if (!text || text.indexOf("전체") > -1 || text === "all") return;
        selectChecks.push(text);
      });

      var visibleCount = 0;
      $rows.each(function () {
        var $tr = $(this);
        var rowText = normalizeText($tr.text());
        var ok = true;

        if (keyword) ok = ok && rowText.indexOf(keyword) > -1;
        if (ok && selectChecks.length) {
          for (var i = 0; i < selectChecks.length; i += 1) {
            if (rowText.indexOf(selectChecks[i]) < 0) {
              ok = false;
              break;
            }
          }
        }

        if (ok && (sdate || edate)) {
          var rowDate = parseDateYmd($tr.text());
          if (sdate && rowDate && rowDate < sdate) ok = false;
          if (edate && rowDate && rowDate > edate) ok = false;
        }

        $tr.toggle(ok);
        if (ok) visibleCount += 1;
      });

      var $empty = $container.find(".local-empty-row");
      if (!$empty.length) {
        var col =
          $table.find("thead th").length ||
          $table.find("tr").first().children().length ||
          5;
        $table
          .find("tbody")
          .append(
            '<tr class="local-empty-row" style="display:none;"><td colspan="' +
              col +
              '" class="text-center text-muted">검색 결과가 없습니다.</td></tr>',
          );
        $empty = $container.find(".local-empty-row");
      }
      $empty.toggle(visibleCount === 0);
    }

    function resetFilterForm($form) {
      $form.find("select").each(function () {
        this.selectedIndex = 0;
      });
      $form.find('input[type="text"], input[type="search"]').val("");
      filterRowsByForm($form);
    }

    function fallbackRawWrite(mode) {
      var $table = $scope
        .find("table")
        .filter(function () {
          return (
            $(this).find("tbody").length > 0 &&
            $(this).find("tr").first().children().length >= 8
          );
        })
        .first();
      if (!$table.length) return false;

      var reason = String(
        window.prompt("사유를 입력해 주세요.", "사용자 요청") || "",
      ).trim();
      if (!reason) return false;

      var cols = $table.find("tr").first().children().length || 8;
      var nextNo = ($table.find("tbody tr").length || 0) + 1;
      var stamp = new Date().toISOString().slice(0, 10);
      var uid = "local_" + Date.now();

      var html = ["<tr>"];
      for (var i = 0; i < cols; i += 1) {
        if (i === 0)
          html.push(
            "<td><input type='checkbox' name='data_checked[]' value='" +
              uid +
              "'></td>",
          );
        else if (i === 1) html.push("<td>" + nextNo + "</td>");
        else if (i === 2) html.push("<td>신규</td>");
        else if (i === cols - 4) html.push("<td>" + reason + "</td>");
        else if (i === cols - 3) html.push("<td>" + stamp + "</td>");
        else if (i === cols - 2) html.push("<td>접수</td>");
        else if (i === cols - 1)
          html.push(
            "<td><a href='#none;'><i class='fa fa-trash-o icon_btn'></i></a></td>",
          );
        else html.push("<td>-</td>");
      }
      html.push("</tr>");
      $table.find("tbody").prepend(html.join(""));
      notify(
        mode === "input"
          ? "일괄등록(로컬)이 완료되었습니다."
          : "등록(로컬)이 완료되었습니다.",
      );
      return true;
    }

    function fallbackRawDownload(prefix) {
      var $table = $();
      var maxRows = -1;
      $scope.find("table").each(function () {
        var $t = $(this);
        var rows = $t.find("tbody tr:visible").filter(function () {
          return $(this).find("td").length > 1;
        }).length;
        if (rows > maxRows) {
          maxRows = rows;
          $table = $t;
        }
      });
      if (!$table.length) return false;
      var lines = readTableAsCsvLines($table, "tbody tr:visible");
      if (lines.length <= 1) {
        notify("내보낼 데이터가 없습니다.");
        return false;
      }
      downloadCsv(
        (prefix || "search-result") + "-" + nowStamp() + ".csv",
        lines,
      );
      return true;
    }

    $scope.find("a[href]").each(function () {
      var $a = $(this);
      var href = String($a.attr("href") || "").trim();
      var mapped = mapDbdbUrlToLocal(href);
      if (mapped) {
        $a.attr("href", mapped);
        if (!$a.attr("target")) $a.removeAttr("target");
      } else if (/^https?:\/\//i.test(href) && !$a.attr("target")) {
        $a.attr("target", "_blank");
        $a.attr("rel", "noopener noreferrer");
      }
    });

    $scope.find("[onclick]").each(function () {
      var $el = $(this);
      var raw = String($el.attr("onclick") || "");
      var m = raw.match(/location\.href\s*=\s*['"]([^'"]+)['"]/i);
      if (!m || !m[1]) return;
      var mapped = mapDbdbUrlToLocal(m[1]);
      if (!mapped) return;
      $el.attr("onclick", raw.replace(m[1], mapped));
    });

    $scope.find("form[action]").each(function () {
      var $f = $(this);
      var action = String($f.attr("action") || "").trim();
      var mapped = mapDbdbUrlToLocal(action);
      if (mapped) $f.attr("action", mapped);
    });

    $(document).on(
      "submit",
      ".module-raw-content form, .school-raw-content form",
      function (e) {
        var $form = $(this);
        var formName = String($form.attr("name") || "");
        var formId = String($form.attr("id") || "");
        var isSearchForm =
          /^fm_list_search/.test(formName) || /^fm_list_search/.test(formId);
        if (isSearchForm) {
          e.preventDefault();
          filterRowsByForm($form);
          return;
        }

        if (formName === "fm_list" || formId === "fm_list") {
          e.preventDefault();
          var action = String(
            $form.find('[name="update_type"]').val() || "",
          ).trim();
          var $checked = $form.find(
            "input[name='data_checked[]']:checked, input[name='check[]']:checked",
          );
          if (!action) {
            notify("일괄 적용 항목을 선택해 주세요.");
            return;
          }
          if (!$checked.length) {
            notify("적용할 항목을 선택해 주세요.");
            return;
          }
          if (action === "del") {
            if (!window.confirm("선택한 항목을 삭제하시겠습니까?")) return;
            $checked.closest("tr").remove();
            notify("선택 항목이 삭제되었습니다.");
            return;
          }
          if (action === "move") {
            var target = String(
              window.prompt("이동할 강좌명을 입력해 주세요.", "") || "",
            ).trim();
            if (!target) return;
            $checked.each(function () {
              var $tr = $(this).closest("tr");
              var $lecCell = $tr.find("td.text-left").first();
              if (!$lecCell.length) return;
              var raw = String($lecCell.text() || "")
                .replace(/\s+/g, " ")
                .trim();
              var updated = raw;
              if (raw.indexOf("] ") > -1)
                updated = raw.replace(/^\[[^\]]+\]\s*/, "[" + target + "] ");
              else updated = "[" + target + "] " + raw;
              $lecCell.text(updated);
            });
            notify("선택 신청자가 다른 강좌로 이동 처리되었습니다.");
            return;
          }
          if (action.indexOf("status_") === 0) {
            var val = action.replace("status_", "");
            $checked.each(function () {
              var $tr = $(this).closest("tr");
              var idm = String(
                $tr.find("[id^='view_mem_status_']").attr("id") || "",
              ).match(/(\d+)$/);
              var num = idm ? idm[1] : "";
              if (!num) return;
              if (typeof window.chk_mem_status === "function")
                window.chk_mem_status(num, Number(val));
            });
            notify("선택 항목 상태가 변경되었습니다.");
            return;
          }
        }

        var action = String($form.attr("action") || "").trim();
        var mapped = mapDbdbUrlToLocal(action);
        if (mapped) {
          e.preventDefault();
          window.location.href = mapped;
          return;
        }
        if (/^https?:\/\/[^/]*dbdbschool\.kr/i.test(action)) {
          e.preventDefault();
          notify("원본 서버 저장은 비활성화되어 로컬 화면만 유지됩니다.");
        }
      },
    );

    $(document).on(
      "click",
      ".module-raw-content form[name^='fm_list_search'] input[type='button'][value='전체'], .school-raw-content form[name^='fm_list_search'] input[type='button'][value='전체']",
      function (e) {
        e.preventDefault();
        var $form = $(this).closest("form");
        resetFilterForm($form);
      },
    );

    $(document).on(
      "change",
      ".module-raw-content form[name^='fm_list_search'] select, .school-raw-content form[name^='fm_list_search'] select",
      function () {
        var $form = $(this).closest("form");
        filterRowsByForm($form);
      },
    );

    $(document).on(
      "change",
      ".module-raw-content #check_all, .school-raw-content #check_all, .module-raw-content #chk_all, .school-raw-content #chk_all",
      function () {
        var checked = this.checked;
        var $form = $(this).closest("form");
        var $target = $form.length ? $form : $scope;
        $target
          .find('input[type="checkbox"]')
          .not(this)
          .filter(function () {
            var nm = String(this.name || "").toLowerCase();
            var id = String(this.id || "").toLowerCase();
            return nm.indexOf("all") < 0 && id.indexOf("all") < 0;
          })
          .prop("checked", checked);
      },
    );

    $(document).on(
      "click",
      ".module-raw-content .btn[type='submit'], .school-raw-content .btn[type='submit']",
      function () {
        var $btn = $(this);
        if ($btn.closest("form").length) return;
        var text = ($btn.text() || "").replace(/\s+/g, " ").trim();
        if (text) notify("버튼 동작: " + text);
      },
    );

    // 상세검색/추가기능 토글
    $scope.find("#main_control_box_search").removeClass("is-open").hide();
    $scope.find("#main_control_box_drop").removeClass("is-open").hide();
    $scope
      .find("#main_control_box_btn01, #main_control_box_btn02")
      .each(function () {
        var $btn = $(this);
        var targetId =
          $btn.attr("id") === "main_control_box_btn01"
            ? "#main_control_box_search"
            : "#main_control_box_drop";
        var $target = $btn.next(targetId);
        if (!$target.length) return;

        $btn.off("click.rawtoggle").on("click.rawtoggle", function (e) {
          e.preventDefault();
          var open = !$target.hasClass("is-open");
          $target.toggleClass("is-open", open).toggle(open);

          if ($btn.attr("id") === "main_control_box_btn01") {
            var $strong = $btn.find("strong");
            if ($strong.length) $strong.text(open ? "닫기" : "열기");
            else $btn.text(open ? "상세검색 닫기" : "상세검색 열기");
          }
        });
      });

    // 상태 드롭다운 토글(교직원/학생 등)
    $(document).on(
      "click",
      ".module-raw-content .isu_check_box > a, .school-raw-content .isu_check_box > a",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $a = $(this);
        var $menu = $a.siblings(".isu_choice");
        $(".module-raw-content .isu_choice, .school-raw-content .isu_choice")
          .not($menu)
          .hide();
        $menu.toggle();
      },
    );
    $(document).on("click", function () {
      $(
        ".module-raw-content .isu_choice, .school-raw-content .isu_choice",
      ).hide();
    });
    $(document).on(
      "click",
      ".module-raw-content .isu_choice, .school-raw-content .isu_choice",
      function (e) {
        e.stopPropagation();
      },
    );

    var params = getSearchParams();
    if (params) {
      var dl = String(params.get("download") || "").trim();
      if (dl) {
        var dlPrefix = "search-result";
        if (dl === "all") dlPrefix = "all-result";
        if (dl === "all_collect") dlPrefix = "all-collect";
        if (dl === "month") dlPrefix = "month-report";
        if (dl === "bank") dlPrefix = "bank-report";
        if (dl === "admin") dlPrefix = "admin-report";
        if (dl === "neis") dlPrefix = "neis-report";
        if (dl === "schedule") dlPrefix = "teacher-schedule";
        if (typeof window.chk_excel === "function") window.chk_excel();
        else fallbackRawDownload(dlPrefix);
      }

      var mode = String(params.get("mode") || "").trim();
      if (mode === "write" || mode === "input" || mode === "apply") {
        if (typeof window.chk_write === "function")
          window.chk_write(mode === "input" ? "writes" : "write");
        else fallbackRawWrite(mode);
      } else if (mode === "modify") {
        var num = String(params.get("num") || "").trim();
        if (num)
          notify(
            "대상자 수정 화면(번호: " +
              num +
              ")은 원본과 동일하게 목록 화면에서 대체 표시됩니다.",
          );
        else
          notify(
            "대상자 수정 화면은 원본과 동일하게 목록 화면에서 대체 표시됩니다.",
          );
      } else if (mode === "free_month") {
        $("#box_free_month").show();
      }

      if (dl || mode)
        window.history.replaceState({}, "", window.location.pathname);
    }
  }

  function bindLegacyInlineCompat() {
    var g = window;
    function setIfMissing(name, fn) {
      if (typeof g[name] !== "function") g[name] = fn;
    }

    setIfMissing("back", function () {
      window.history.back();
      return false;
    });

    setIfMissing("chkMoney", function (el) {
      if (!el) return true;
      el.value = String(el.value || "").replace(/[^\d]/g, "");
      return true;
    });

    setIfMissing("chk_all", function (el) {
      var $root = $(el).closest("form");
      if (!$root.length) $root = $(document);
      $root
        .find('input[type="checkbox"]')
        .not(el)
        .prop("checked", !!el.checked);
      return true;
    });

    setIfMissing("chk_box_free_month", function (mode) {
      var $box = $("#box_free_month");
      if (!$box.length) return true;
      if (mode === "show") $box.show();
      else $box.hide();
      return true;
    });
    setIfMissing("chk_free_level", function () {
      return true;
    });
    setIfMissing("chk_free_num", function () {
      return true;
    });
    setIfMissing("chk_month", function () {
      return true;
    });
    setIfMissing("chkAdd", function () {
      return true;
    });

    setIfMissing("fm_edit_check", function () {
      return true;
    });
    setIfMissing("fm_list_check", function () {
      return true;
    });
    setIfMissing("fm_verify_check", function () {
      return true;
    });
    setIfMissing("fm_clear_check", function () {
      return true;
    });
    setIfMissing("fm_comm_login_check", function () {
      return true;
    });
    setIfMissing("fm_free_month_check", function (fm) {
      var $f = $(fm || "#fm_free_month");
      var labels = [];
      $f.find("input[name='free_month[]']:checked").each(function () {
        var id = String($(this).attr("id") || "");
        var $lb = id ? $("label[for='" + id + "']").first() : $();
        labels.push(($lb.text() || "").trim());
      });
      if (labels.length) {
        $("#view_free_month").html(
          labels
            .map(function (x) {
              return '<span class=\"free_month_on\">' + x + "</span>";
            })
            .join(" "),
        );
      }
      $("#box_free_month").hide();
      notify("조회 허용 월이 적용되었습니다.");
      return false;
    });

    setIfMissing("remember_memory", function () {
      return true;
    });
    setIfMissing("delAddMem", function () {
      notify("추가 담당자 항목이 삭제되었습니다.");
      return true;
    });

    setIfMissing("openMemWin", function (href) {
      var mapped = mapDbdbUrlToLocal(href);
      window.open(
        mapped || href || "about:blank",
        "_blank",
        "width=980,height=780",
      );
      return false;
    });
    setIfMissing("openAfTeaWin", function (href) {
      var mapped = mapDbdbUrlToLocal(href);
      window.open(
        mapped || href || "about:blank",
        "_blank",
        "width=980,height=780",
      );
      return false;
    });
    setIfMissing("openSortWin", function (href) {
      var mapped = mapDbdbUrlToLocal(href);
      var target = mapped || href || "about:blank";
      if (/popups\/fund-config-sorts\.html/i.test(target)) {
        var items = collectFundConfigSortItems();
        if (items.length) saveJson(FUND_CFG_SORT_ITEMS_KEY, items);
      }
      window.open(target, "_blank", "width=980,height=780");
      return false;
    });
    setIfMissing("openLecTimeWin", function (href) {
      var mapped = mapDbdbUrlToLocal(href);
      window.open(
        mapped || href || "about:blank",
        "_blank",
        "width=980,height=780",
      );
      return false;
    });

    setIfMissing("chk_excel", function () {
      var $table = $();
      var maxRows = -1;
      $("table").each(function () {
        var $t = $(this);
        var rows = $t.find("tbody tr:visible").filter(function () {
          return $(this).find("td").length > 1;
        }).length;
        if (rows > maxRows) {
          maxRows = rows;
          $table = $t;
        }
      });
      if (!$table.length) return false;
      var lines = readTableAsCsvLines($table, "tbody tr:visible");
      if (lines.length <= 1) {
        notify("내보낼 데이터가 없습니다.");
        return false;
      }
      downloadCsv("search-result-" + nowStamp() + ".csv", lines);
      return false;
    });

    setIfMissing("chk_cancel", function (num) {
      if (!window.confirm("삭제하시겠습니까?")) return false;
      var $row = $("tr")
        .has('a[onclick*="chk_cancel(' + String(num) + '"]')
        .first();
      if ($row.length) $row.remove();
      return false;
    });
    setIfMissing("chk_del", function () {
      if (!window.confirm("삭제하시겠습니까?")) return false;
      $(
        ".chk-row:checked, input[name='check[]']:checked, input[name='data_checked[]']:checked",
      )
        .closest("tr")
        .remove();
      return false;
    });
    setIfMissing("chkDel", function () {
      if (!window.confirm("삭제하시겠습니까?")) return false;
      return false;
    });
    setIfMissing("chk_app", function (num, statusCode) {
      var n = String(num || "");
      var s = Number(statusCode);
      var label = s === 2 ? "처리완료" : s === 1 ? "강사확인" : "접수";
      var $row = $("tr")
        .has("a[onclick*='chk_app(" + n + "']")
        .first();
      if ($row.length) {
        var $cells = $row.find("td");
        var idx = Math.max(0, $cells.length - 2);
        $cells.eq(idx).text(label);
      }
      return false;
    });
    setIfMissing("chk_mem_status", function (num, status) {
      var n = String(num || "");
      var s = Number(status) === 1 ? 1 : 0;
      var $view = $("#view_mem_status_" + n);
      if ($view.length) {
        $view.text(s === 1 ? "사용" : "대기");
        $view
          .removeClass("isu_status_1 isu_status_0 btn-danger btn-default")
          .addClass(s === 1 ? "isu_status_1" : "isu_status_0");
      }
      $("#mem_status_num").val(n);
      $("#mem_status").val(s);
      return false;
    });
    setIfMissing("chkModify", function () {
      notify("수정이 적용되었습니다.");
      return false;
    });
    setIfMissing("chkSortUp", function () {
      notify("정렬 순서를 변경했습니다.");
      return false;
    });

    setIfMissing("chk_write", function (mode) {
      var $table = $("table")
        .filter(function () {
          return (
            $(this).find("tbody").length > 0 &&
            $(this).find("tr").first().children().length >= 8
          );
        })
        .first();

      if (!$table.length) {
        notify("등록 화면을 준비 중입니다.");
        return false;
      }

      var reason = String(
        window.prompt("사유를 입력해 주세요.", "사용자 요청") || "",
      ).trim();
      if (!reason) return false;

      var cols = $table.find("tr").first().children().length || 8;
      var nextNo = ($table.find("tbody tr").length || 0) + 1;
      var stamp = new Date().toISOString().slice(0, 10);
      var uid = "local_" + Date.now();

      var html = ["<tr>"];
      for (var i = 0; i < cols; i += 1) {
        if (i === 0)
          html.push(
            "<td><input type='checkbox' name='data_checked[]' value='" +
              uid +
              "'></td>",
          );
        else if (i === 1) html.push("<td>" + nextNo + "</td>");
        else if (i === 2) html.push("<td>신규</td>");
        else if (i === cols - 4) html.push("<td>" + reason + "</td>");
        else if (i === cols - 3) html.push("<td>" + stamp + "</td>");
        else if (i === cols - 2) html.push("<td>접수</td>");
        else if (i === cols - 1)
          html.push(
            "<td><a href='#none;' onclick='return chk_cancel(" +
              Date.now() +
              ",2);'><i class='fa fa-trash-o icon_btn'></i></a></td>",
          );
        else html.push("<td>-</td>");
      }
      html.push("</tr>");
      $table.find("tbody").prepend(html.join(""));

      notify(
        mode === "writes"
          ? "일괄등록(로컬)이 완료되었습니다."
          : "등록(로컬)이 완료되었습니다.",
      );
      return false;
    });
    setIfMissing("chkSortDown", function () {
      notify("정렬 순서를 변경했습니다.");
      return false;
    });

    setIfMissing("open_stu_schedule", function () {
      notify("학생 시간표 보기 팝업(로컬 데모)");
      return false;
    });

    setIfMissing("show_stu_hp", function (num, stuNum) {
      var $cell = $(".stu_hp_" + String(stuNum)).first();
      if (!$cell.length) return false;
      var current = ($cell.text() || "").split(/\n|,/)[0].trim();
      var next = window.prompt("연락처 수정", current);
      if (next !== null && String(next).trim()) {
        $cell.text(String(next).trim());
      }
      return false;
    });

    setIfMissing("init_class_name", function () {
      var maxClass = parseInt($("#maxClass").val(), 10) || 0;
      var use = $("#useClassName").is(":checked");
      var $box = $("#class_name_box");
      if (!$box.length) return true;
      if (!use || maxClass <= 0) {
        $box.empty();
        return true;
      }
      var html = [];
      for (var i = 1; i <= maxClass; i += 1) {
        html.push(
          '<div style="margin-top:4px;"><span style="display:inline-block;width:36px;">' +
            i +
            "반</span>",
        );
        html.push(
          '<input type="text" class="form-control input-sm" style="width:180px;display:inline-block;" placeholder="' +
            i +
            '반 명칭"></div>',
        );
      }
      $box.html(html.join(""));
      return true;
    });

    setIfMissing("fm_list_search_check", function (fm) {
      var $fm = $(fm || []);
      var s = String($fm.find("[name='sdate']").val() || "").trim();
      var e = String($fm.find("[name='edate']").val() || "").trim();
      if (s && e && s > e) {
        window.alert("시작일이 종료일보다 클 수 없습니다.");
        return false;
      }
      return true;
    });

    setIfMissing("chk_search_date", function (form, mode) {
      var $f = form ? $(form) : $("form[name='fm_list_search']").first();
      if (!$f.length) return false;

      var $s = $f.find("#sdate, [name='sdate']").first();
      var $e = $f.find("#edate, [name='edate']").first();
      if (!$s.length || !$e.length) return false;

      var now = new Date();
      var start = new Date(now);
      var end = new Date(now);

      if (Number(mode) === 1) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (Number(mode) === 2) {
        start = new Date(now);
        start.setDate(start.getDate() - 30);
      } else if (Number(mode) === 3) {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      }

      function fmt(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
      }

      $s.val(fmt(start));
      $e.val(fmt(end));
      $f.trigger("submit");
      return false;
    });
  }

  applyPageFileClass();
  applyUnifiedSidebar();
  normalizeUserRole();
  bindLogoutAction();
  requireAuth();
  bindPlaceholderLinks();
  bindIndexPage();
  bindBulkInputPage();
  bindBulkModifyPage();
  bindCopyPage();
  bindStatsPage();
  bindQandaPage();
  bindModulePage();
  bindWritePage();
  bindSurveySampleWritePage();
  bindManualPage();
  bindAttendancePage();
  bindApplicantsPage();
  bindWaitlistPage();
  bindRawClonePages();
  bindFundConfigPage();
  bindLegacyInlineCompat();
})();
