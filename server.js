// ==========================================
// 1. 모듈 및 환경 설정
// ==========================================
require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const config = require("./config");

const app = express();
const PORT = Number(config.port || process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const SESSION_COOKIE = "dbdb_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. 유틸리티 및 암호화 함수
// ==========================================
function nowIso() {
  return new Date().toISOString();
}

function parseCookies(req) {
  const cookie = String(req.headers.cookie || "");
  return cookie.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.split("=");
    const key = String(rawKey || "").trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("=").trim());
    return acc;
  }, {});
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);
  if (options.maxAge != null)
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  parts.push("HttpOnly");
  parts.push(`SameSite=${options.sameSite || "Lax"}`);
  res.append("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
  res.append(
    "Set-Cookie",
    `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  );
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, expected] = String(passwordHash || "").split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(actual, "hex"),
    Buffer.from(expected, "hex"),
  );
}

// ==========================================
// 4. 세션 및 사용자/권한 공통 함수
// ==========================================
function normalizeRole(role) {
  return ["staff", "teacher", "student"].includes(role) ? role : "staff";
}

function studentLoginId({ grade, classNo, studentNo, name }) {
  return `student:${grade}-${classNo}-${studentNo}:${name}`;
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    loginId: row.login_id,
    displayName: row.display_name,
    fullName: row.full_name,
    phone: row.phone,
    grade: row.grade || "",
    classNo: row.class_no || "",
    studentNo: row.student_no || "",
    createdAt: row.created_at,
  };
}

// 개발용 초기 데이터 생성 함수
async function seedAdmin() {
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("login_id", "admin")
      .maybeSingle();

    if (!existing) {
      console.log("Seeding initial admin user...");
      const { error } = await supabase.from("users").insert({
        role: "staff",
        login_id: "admin",
        password_hash: hashPassword("admin1234"),
        display_name: "운영담당자",
        full_name: "운영담당자",
        created_at: nowIso(),
      });
      if (error) throw error;
      console.log("Admin user created: admin / admin1234");
    }
  } catch (err) {
    console.warn("Seed admin check skipped or failed:", err.message);
  }
}

async function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const { error } = await supabase.from("sessions").insert({
    token,
    user_id: userId,
    created_at: nowIso(),
    expires_at: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
  });
  if (error) console.error("Session creation error:", error);
  return token;
}

async function getSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select("expires_at, users(*)")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabase.from("sessions").delete().eq("token", token);
    return null;
  }
  return sanitizeUser(data.users);
}

// ==========================================
// 6. 미들웨어 및 API 라우터
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.redirect("/login.html");
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/api/auth/session", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }
  return res.json({ ok: true, user });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const role = normalizeRole(req.body.role);
    const password = String(req.body.password || "").trim();
    const fullName = String(
      req.body.fullName || req.body.displayName || "",
    ).trim();
    const phone = String(req.body.phone || "").trim();

    if (!fullName || !phone || !password) {
      return res.status(400).json({ ok: false, message: "필수 정보를 입력해 주세요." });
    }

    if (password.length < 4) {
      return res.status(400).json({ ok: false, message: "비밀번호는 4자 이상으로 입력해 주세요." });
    }

    let loginId = "";
    let grade = "";
    let classNo = "";
    let studentNo = "";

    if (role === "student") {
      grade = String(req.body.grade || "").trim();
      classNo = String(req.body.classNo || "").trim();
      studentNo = String(req.body.studentNo || "").trim();
      if (!grade || !classNo || !studentNo) {
        return res.status(400).json({ ok: false, message: "학생 정보를 모두 선택해 주세요." });
      }
      loginId = studentLoginId({ grade, classNo, studentNo, name: fullName });
    } else {
      loginId = String(req.body.loginId || "").trim();
      if (!loginId) {
        return res.status(400).json({ ok: false, message: "아이디를 입력해 주세요." });
      }
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("login_id", loginId)
      .single();

    if (existing) {
      return res.status(409).json({ ok: false, message: "이미 등록된 계정입니다." });
    }

    const { data: newUser, error } = await supabase.from("users").insert({
      role,
      login_id: loginId,
      password_hash: hashPassword(password),
      display_name: fullName,
      full_name: fullName,
      phone,
      grade,
      class_no: classNo,
      student_no: studentNo,
      created_at: nowIso(),
    }).select().single();

    if (error) throw error;

    return res.status(201).json({
      ok: true,
      message: "회원가입이 완료되었습니다. 로그인해 주세요.",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res) => {
  const role = normalizeRole(req.body.role);
  let user;

  if (role === "student") {
    const grade = String(req.body.grade || "").trim();
    const classNo = String(req.body.classNo || "").trim();
    const studentNo = String(req.body.studentNo || "").trim();
    const name = String(req.body.name || "").trim();
    const password = String(req.body.password || "").trim();

    if (!grade || !classNo || !studentNo || !name || !password) {
      return res.status(400).json({ ok: false, message: "학생 로그인 정보를 모두 입력해 주세요." });
    }

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", role)
      .eq("login_id", studentLoginId({ grade, classNo, studentNo, name }))
      .single();
    user = data;
  } else {
    const loginId = String(req.body.loginId || "").trim();
    const password = String(req.body.password || "").trim();
    if (!loginId || !password) {
      return res.status(400).json({ ok: false, message: "아이디와 비밀번호를 입력해 주세요." });
    }
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", role)
      .eq("login_id", loginId)
      .single();
    user = data;
  }

  if (!user || !verifyPassword(String(req.body.password || "").trim(), user.password_hash)) {
    return res.status(401).json({ ok: false, message: "로그인 정보가 일치하지 않습니다." });
  }

  const token = await createSession(user.id);
  setCookie(res, SESSION_COOKIE, token, { maxAge: SESSION_MAX_AGE_MS });
  return res.json({ ok: true, user: sanitizeUser(user) });
});

app.post("/api/auth/logout", async (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) {
    await supabase.from("sessions").delete().eq("token", token);
  }
  clearCookie(res, SESSION_COOKIE);
  return res.json({ ok: true });
});

app.get("/api/auth/users", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user || user.role !== "staff") {
    return res.status(403).json({ ok: false, message: "관리자 권한이 필요합니다." });
  }
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });
    
  return res.json({ ok: true, users: (users || []).map(sanitizeUser) });
});

app.post("/api/school/config", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user || user.role !== "staff") {
    return res.status(403).send("권한이 없습니다. (관리자 전용)");
  }
  // 추가 폼 처리 로직 (학생 기본 설정 DB Update 등)
  res.redirect("/school-student-main.html?success=true");
});

app.use(express.static(ROOT_DIR));

app.use((error, _req, res, _next) => {
  console.error("Server Error:", error);
  const status = Number(error.status || 500);
  return res.status(status).json({
    ok: false,
    message: status >= 500 ? "서버 처리 중 오류가 발생했습니다." : error.message,
  });
});

// ==========================================
// 7. 서버 구동
// ==========================================
app.listen(PORT, async () => {
    console.log(`DBDB auth server listening on http://localhost:${PORT}/login.html`);
    console.log(`Connected to Supabase: ${supabaseUrl}`);
    
    // 서버 구동 시 관리자 계정 유무 확인 및 자동 생성
    await seedAdmin();
});
