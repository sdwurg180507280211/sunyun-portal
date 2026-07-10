import {randomBytes} from "node:crypto";
import {getDatabase} from "@/lib/db/database";
import type {LeadInput} from "@/lib/validation/lead";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "closed";

export interface LeadRecord {
  id: string;
  createdAt: string;
  serviceType: string;
  companyName: string;
  contactName: string;
  phone: string;
  wechat: string;
  city: string;
  expectedDate: string;
  scale: string;
  budget: string;
  description: string;
  source: string;
  status: LeadStatus;
  assignedTo: string;
  updatedAt: string;
}

interface CreateLeadContext {
  ip: string;
  userAgent: string;
}

interface LegacyLead {
  id?: string;
  createdAt?: string;
  serviceType?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  wechat?: string;
  city?: string;
  eventDate?: string;
  expectedDate?: string;
  attendees?: string;
  scale?: string;
  budget?: string;
  description?: string;
  source?: string;
  userAgent?: string;
  ip?: string;
  status?: LeadStatus;
}

const selectColumns = `
  id,
  created_at AS createdAt,
  service_type AS serviceType,
  company_name AS companyName,
  contact_name AS contactName,
  phone,
  wechat,
  city,
  expected_date AS expectedDate,
  scale,
  budget,
  description,
  source,
  status,
  assigned_to AS assignedTo,
  updated_at AS updatedAt
`;

function createLeadId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SY-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function createLead(input: LeadInput, context: CreateLeadContext): LeadRecord {
  const database = getDatabase();
  const now = new Date().toISOString();
  const lead: LeadRecord = {
    id: createLeadId(),
    createdAt: now,
    serviceType: input.serviceType,
    companyName: input.companyName,
    contactName: input.contactName,
    phone: input.phone,
    wechat: input.wechat,
    city: input.city,
    expectedDate: input.expectedDate,
    scale: input.scale,
    budget: input.budget,
    description: input.description,
    source: input.source,
    status: "new",
    assignedTo: "",
    updatedAt: now,
  };

  database
    .prepare(`
      INSERT INTO leads (
        id, created_at, service_type, company_name, contact_name, phone, wechat, city,
        expected_date, scale, budget, description, source, user_agent, ip, status, assigned_to, updated_at
      ) VALUES (
        @id, @createdAt, @serviceType, @companyName, @contactName, @phone, @wechat, @city,
        @expectedDate, @scale, @budget, @description, @source, @userAgent, @ip, @status, @assignedTo, @updatedAt
      )
    `)
    .run({...lead, ...context});

  return lead;
}

export function listLeads(options: {query?: string; status?: string; limit?: number; offset?: number}) {
  const database = getDatabase();
  const query = options.query?.trim() || "";
  const status = options.status?.trim() || "";
  const limit = Math.min(Math.max(options.limit || 100, 1), 200);
  const offset = Math.max(options.offset || 0, 0);
  const conditions: string[] = [];
  const filterParams: Record<string, unknown> = {};

  if (query) {
    conditions.push(`(company_name LIKE @search OR contact_name LIKE @search OR phone LIKE @search OR description LIKE @search OR service_type LIKE @search)`);
    filterParams.search = `%${query}%`;
  }
  if (status) {
    conditions.push("status = @status");
    filterParams.status = status;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const leads = database
    .prepare(`SELECT ${selectColumns} FROM leads ${where} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
    .all({...filterParams, limit, offset}) as LeadRecord[];
  const countRow = database.prepare(`SELECT COUNT(*) AS count FROM leads ${where}`).get(filterParams) as {count: number};
  const total = Number(countRow.count || 0);
  const stats = database
    .prepare(`SELECT status, COUNT(*) AS count FROM leads GROUP BY status`)
    .all() as Array<{status: LeadStatus; count: number}>;

  return {leads, total, stats: Object.fromEntries(stats.map((item) => [item.status, item.count]))};
}

export function updateLeadStatus(id: string, status: LeadStatus, actor: string) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const transaction = database.transaction(() => {
    const result = database.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?").run(status, now, id);
    if (!result.changes) return false;
    database
      .prepare("INSERT INTO audit_logs (created_at, actor, action, entity_id, details) VALUES (?, ?, ?, ?, ?)")
      .run(now, actor, "lead.status.updated", id, JSON.stringify({status}));
    return true;
  });
  return transaction();
}

export function importLegacyLead(raw: LegacyLead) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const id = raw.id || createLeadId();
  const createdAt = raw.createdAt || now;
  return database
    .prepare(`
      INSERT OR IGNORE INTO leads (
        id, created_at, service_type, company_name, contact_name, phone, wechat, city,
        expected_date, scale, budget, description, source, user_agent, ip, status, assigned_to, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)
    `)
    .run(
      id,
      createdAt,
      raw.serviceType || "未分类",
      raw.companyName || "",
      raw.contactName || "未填写",
      raw.phone || "未知",
      raw.wechat || "",
      raw.city || "",
      raw.expectedDate || raw.eventDate || "",
      raw.scale || raw.attendees || "",
      raw.budget || "",
      raw.description || "旧版线索导入",
      raw.source || "legacy-jsonl",
      raw.userAgent || "",
      raw.ip || "",
      raw.status || "new",
      createdAt,
    );
}

export function databaseHealth() {
  const row = getDatabase().prepare("SELECT 1 AS ok").get() as {ok: number};
  return row.ok === 1;
}
