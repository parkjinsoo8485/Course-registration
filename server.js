const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const initSqlJs = require("sql.js");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const DB_PATH = path.join(DATA_DIR, "auth.sqlite");
const SESSION_COOKIE = "dbdb_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

let db;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

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
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  parts.push("HttpOnly");
  parts.push(`SameSite=${options.sameSite || "Lax"}`);
  res.append("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
  res.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, expected] = String(passwordHash || "").split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function persistDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function exec(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  persistDb();
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function normalizeRole(role) {
  return ["staff", "teacher", "student"].includes(role) ? role : "staff";
}

function studentLoginId({ grade, classNo, studentNo, name }) {
  return `student:${grade}-${classNo}-${studentNo}:${name}`;
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    role: row.role,
    loginId: row.login_id,
    displayName: row.display_name,
    fullName: row.full_name,
    phone: row.phone,
    grade: row.grade || "",
    classNo: row.class_no || "",
    studentNo: row.student_no || "",
    createdAt: row.created_at
  };
}

function requireField(value, message) {
  if (!String(value || "").trim()) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
}

function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  exec(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [token, userId, nowIso(), new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString()]
  );
  return token;
}

function getSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const row = queryOne(
    `SELECT sessions.expires_at, users.*
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ?`,
    [token]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    exec("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  return sanitizeUser(row);
}

function seedUsers() {
  const exists = queryOne("SELECT COUNT(*) AS count FROM users");
  if (Number(exists.count) > 0) return;

  const users = [
    {
      role: "staff",
      loginId: "admin",
      password: "admin1234",
      displayName: "운영담당자",
      fullName: "운영담당자",
      phone: "010-1234-5678"
    },
    {
      role: "teacher",
      loginId: "teacher01",
      password: "teacher1234",
      displayName: "기본강사",
      fullName: "기본강사",
      phone: "010-2222-3333"
    },
    {
      role: "student",
      loginId: studentLoginId({ grade: "1", classNo: "1", studentNo: "1", name: "홍길동" }),
      password: "student1234",
      displayName: "홍길동",
      fullName: "홍길동",
      phone: "010-5555-6666",
      grade: "1",
      classNo: "1",
      studentNo: "1"
    }
  ];

  users.forEach((user) => {
    exec(
      `INSERT INTO users (
        role, login_id, password_hash, display_name, full_name, phone, grade, class_no, student_no, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.role,
        user.loginId,
        hashPassword(user.password),
        user.displayName,
        user.fullName,
        user.phone,
        user.grade || "",
        user.classNo || "",
        user.studentNo || "",
        nowIso()
      ]
    );
  });
}

async function initDb() {
  ensureDir(DATA_DIR);
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(ROOT_DIR, "node_modules", "sql.js", "dist", file)
  });

  db = fs.existsSync(DB_PATH) ? new SQL.Database(fs.readFileSync(DB_PATH)) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      login_id TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      full_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      grade TEXT DEFAULT '',
      class_no TEXT DEFAULT '',
      student_no TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try {
    db.run("ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT ''");
  } catch (_error) {}
  try {
    db.run("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''");
  } catch (_error) {}

  persistDb();
  seedUsers();
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.redirect("/login.html");
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/api/auth/session", (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }
  return res.json({ ok: true, user });
});

app.post("/api/auth/register", (req, res, next) => {
  try {
    const role = normalizeRole(req.body.role);
    const password = String(req.body.password || "").trim();
    const fullName = String(req.body.fullName || req.body.displayName || "").trim();
    const phone = String(req.body.phone || "").trim();

    requireField(fullName, "성명을 입력해 주세요.");
    requireField(phone, "전화번호를 입력해 주세요.");
    requireField(password, "비밀번호를 입력해 주세요.");

    if (password.length < 4) {
      const error = new Error("비밀번호는 4자 이상으로 입력해 주세요.");
      error.status = 400;
      throw error;
    }

    let loginId = "";
    let grade = "";
    let classNo = "";
    let studentNo = "";

    if (role === "student") {
      grade = String(req.body.grade || "").trim();
      classNo = String(req.body.classNo || "").trim();
      studentNo = String(req.body.studentNo || "").trim();
      requireField(grade, "학년을 선택해 주세요.");
      requireField(classNo, "반을 선택해 주세요.");
      requireField(studentNo, "번호를 선택해 주세요.");
      loginId = studentLoginId({ grade, classNo, studentNo, name: fullName });
    } else {
      loginId = String(req.body.loginId || "").trim();
      requireField(loginId, "아이디를 입력해 주세요.");
    }

    const existing = queryOne("SELECT id FROM users WHERE login_id = ?", [loginId]);
    if (existing) {
      return res.status(409).json({ ok: false, message: "이미 등록된 계정입니다." });
    }

    exec(
      `INSERT INTO users (
        role, login_id, password_hash, display_name, full_name, phone, grade, class_no, student_no, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [role, loginId, hashPassword(password), fullName, fullName, phone, grade, classNo, studentNo, nowIso()]
    );

    const user = queryOne("SELECT * FROM users WHERE login_id = ?", [loginId]);
    return res.status(201).json({
      ok: true,
      message: "회원가입이 완료되었습니다. 로그인해 주세요.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", (req, res) => {
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

    user = queryOne("SELECT * FROM users WHERE role = ? AND login_id = ?", [
      role,
      studentLoginId({ grade, classNo, studentNo, name })
    ]);
  } else {
    const loginId = String(req.body.loginId || "").trim();
    const password = String(req.body.password || "").trim();
    if (!loginId || !password) {
      return res.status(400).json({ ok: false, message: "아이디와 비밀번호를 입력해 주세요." });
    }
    user = queryOne("SELECT * FROM users WHERE role = ? AND login_id = ?", [role, loginId]);
  }

  if (!user || !verifyPassword(String(req.body.password || "").trim(), user.password_hash)) {
    return res.status(401).json({ ok: false, message: "로그인 정보가 일치하지 않습니다." });
  }

  const token = createSession(user.id);
  setCookie(res, SESSION_COOKIE, token, { maxAge: SESSION_MAX_AGE_MS });
  return res.json({ ok: true, user: sanitizeUser(user) });
});

app.post("/api/auth/logout", (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) {
    exec("DELETE FROM sessions WHERE token = ?", [token]);
  }
  clearCookie(res, SESSION_COOKIE);
  return res.json({ ok: true });
});

app.get("/api/auth/users", (_req, res) => {
  const users = queryAll(
    "SELECT id, role, login_id, display_name, full_name, phone, grade, class_no, student_no, created_at FROM users ORDER BY id ASC"
  ).map(sanitizeUser);
  return res.json({ ok: true, users });
});

app.use(express.static(ROOT_DIR));

app.use((error, _req, res, _next) => {
  const status = Number(error.status || 500);
  return res.status(status).json({
    ok: false,
    message: status >= 500 ? "서버 처리 중 오류가 발생했습니다." : error.message
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DBDB auth server listening on http://localhost:${PORT}/login.html`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
