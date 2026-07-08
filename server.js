import { createServer } from "node:http";
import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname, "public");
const dataDir = resolve(__dirname, "data");
const leadsFile = resolve(dataDir, "leads.jsonl");

const port = Number(process.env.PORT || 4173);
const isProduction = process.env.NODE_ENV === "production";
const adminToken = process.env.SUNYUN_ADMIN_TOKEN || (isProduction ? "" : "dev-local-token");
const rateWindowMs = 60 * 60 * 1000;
const maxSubmissionsPerWindow = 8;
const submissionHits = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const requiredLeadFields = ["serviceType", "contactName", "phone", "description"];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.socket.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (submissionHits.get(ip) || []).filter((time) => now - time < rateWindowMs);
  if (hits.length >= maxSubmissionsPerWindow) {
    submissionHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  submissionHits.set(ip, hits);
  return false;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) {
      throw new Error("REQUEST_TOO_LARGE");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function cleanText(value, maxLength = 500) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeLead(input, request) {
  const lead = {
    id: `SY-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`,
    createdAt: new Date().toISOString(),
    serviceType: cleanText(input.serviceType, 60),
    companyName: cleanText(input.companyName, 80),
    contactName: cleanText(input.contactName, 40),
    phone: cleanText(input.phone, 40),
    wechat: cleanText(input.wechat, 60),
    city: cleanText(input.city, 60),
    eventDate: cleanText(input.eventDate, 40),
    attendees: cleanText(input.attendees, 20),
    budget: cleanText(input.budget, 40),
    description: cleanText(input.description, 1200),
    source: cleanText(input.source || "portal", 80),
    userAgent: cleanText(request.headers["user-agent"], 240),
    ip: getClientIp(request)
  };

  const missing = requiredLeadFields.filter((field) => !lead[field]);
  if (missing.length) {
    return { error: `缺少必填字段：${missing.join(", ")}` };
  }

  if (!/^[0-9+\-\s()]{6,24}$/.test(lead.phone)) {
    return { error: "联系电话格式不正确" };
  }

  return { lead };
}

async function handleLeadSubmission(request, response) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    sendJson(response, 429, { ok: false, message: "提交过于频繁，请稍后再试" });
    return;
  }

  try {
    const body = await readBody(request);
    const { lead, error } = normalizeLead(body, request);

    if (error) {
      sendJson(response, 400, { ok: false, message: error });
      return;
    }

    await mkdir(dataDir, { recursive: true });
    await appendFile(leadsFile, `${JSON.stringify(lead)}\n`, "utf8");

    sendJson(response, 201, {
      ok: true,
      id: lead.id,
      message: "需求已进入榫合云项目池",
      nextStep: "1 个工作日内完成需求澄清并给出执行建议"
    });
  } catch (error) {
    if (error.message === "REQUEST_TOO_LARGE") {
      sendJson(response, 413, { ok: false, message: "提交内容过大" });
      return;
    }
    if (error instanceof SyntaxError) {
      sendJson(response, 400, { ok: false, message: "请求格式不是有效 JSON" });
      return;
    }
    console.error("Lead submission failed:", error);
    sendJson(response, 500, { ok: false, message: "服务器暂时无法保存需求" });
  }
}

async function readLeads() {
  try {
    const content = await readFile(leadsFile, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .reverse()
      .slice(0, 200);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function hasAdminAccess(request) {
  const headerToken = request.headers["x-admin-token"];
  return Boolean(adminToken) && headerToken === adminToken;
}

async function handleLeadList(request, response) {
  if (!hasAdminAccess(request)) {
    sendJson(response, 401, { ok: false, message: "无权访问线索数据" });
    return;
  }

  try {
    const leads = await readLeads();
    sendJson(response, 200, { ok: true, leads });
  } catch (error) {
    console.error("Read leads failed:", error);
    sendJson(response, 500, { ok: false, message: "读取线索失败" });
  }
}

async function serveStatic(request, response, url) {
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403, { "x-content-type-options": "nosniff" });
    response.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      response.writeHead(404, { "x-content-type-options": "nosniff" });
      response.end("Not found");
      return;
    }

    const extension = extname(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream",
      "cache-control": extension === ".html" ? "no-cache" : "public, max-age=86400",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404, { "x-content-type-options": "nosniff" });
      response.end("Not found");
      return;
    }
    console.error("Static serving failed:", error);
    response.writeHead(500, { "x-content-type-options": "nosniff" });
    response.end("Internal server error");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "sunyun-portal" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/leads") {
    await handleLeadSubmission(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/leads") {
    await handleLeadList(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    await serveStatic(request, response, url);
    return;
  }

  sendJson(response, 405, { ok: false, message: "Method not allowed" });
});

server.listen(port, () => {
  console.log(`Sunyun portal running at http://localhost:${port}`);
  console.log(`Admin page: http://localhost:${port}/admin.html`);
  if (!adminToken) {
    console.warn("SUNYUN_ADMIN_TOKEN is not configured; lead admin API is disabled.");
  }
});
