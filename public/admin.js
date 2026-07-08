const tokenInput = document.querySelector("#tokenInput");
const loadButton = document.querySelector("#loadLeadsButton");
const exportButton = document.querySelector("#exportButton");
const searchInput = document.querySelector("#searchInput");
const serviceFilter = document.querySelector("#serviceFilter");
const tableBody = document.querySelector("#leadTableBody");
const leadCount = document.querySelector("#leadCount");
const meetingCount = document.querySelector("#meetingCount");
const softwareCount = document.querySelector("#softwareCount");

let allLeads = [];
let currentFilter = { query: "", service: "" };

tokenInput.value = localStorage.getItem("sunyun:adminToken") || "";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getFilteredLeads() {
  const query = currentFilter.query.trim().toLowerCase();
  const service = currentFilter.service;
  return allLeads.filter((lead) => {
    const matchesService = !service || lead.serviceType === service;
    if (!query) return matchesService;
    const text = [
      lead.companyName,
      lead.contactName,
      lead.phone,
      lead.wechat,
      lead.city,
      lead.description,
      lead.serviceType
    ]
      .join(" ")
      .toLowerCase();
    return matchesService && text.includes(query);
  });
}

function renderStats(leads) {
  const meetingKeywords = ["会议", "活动", "物料", "广告"];
  const softwareKeywords = ["软件", "咨询", "培训"];
  leadCount.textContent = String(leads.length);
  meetingCount.textContent = String(
    leads.filter((lead) => meetingKeywords.some((keyword) => lead.serviceType?.includes(keyword))).length
  );
  softwareCount.textContent = String(
    leads.filter((lead) => softwareKeywords.some((keyword) => lead.serviceType?.includes(keyword))).length
  );
}

function renderTable(leads) {
  renderStats(leads);
  if (!leads.length) {
    tableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">暂无线索。</td></tr>`;
    exportButton.disabled = true;
    return;
  }

  tableBody.innerHTML = leads
    .map(
      (lead) => `
        <tr>
          <td>${escapeHtml(lead.id)}</td>
          <td>${escapeHtml(formatDate(lead.createdAt))}</td>
          <td>${escapeHtml(lead.serviceType)}</td>
          <td>${escapeHtml(lead.companyName || "-")}</td>
          <td>${escapeHtml(lead.contactName)}</td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.city || "-")}</td>
          <td>${escapeHtml(lead.description)}</td>
        </tr>
      `
    )
    .join("");
  exportButton.disabled = false;
}

async function loadLeads() {
  const token = tokenInput.value.trim();
  if (!token) {
    tableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">请输入后台访问口令。</td></tr>`;
    return;
  }

  localStorage.setItem("sunyun:adminToken", token);
  loadButton.disabled = true;
  loadButton.textContent = "加载中";

  try {
    const response = await fetch("/api/leads", {
      headers: { "x-admin-token": token }
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      tableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">${escapeHtml(data.message || "加载失败")}</td></tr>`;
      allLeads = [];
      renderStats([]);
      return;
    }
    allLeads = data.leads;
    searchInput.disabled = false;
    serviceFilter.disabled = false;
    renderTable(getFilteredLeads());
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">服务异常，无法读取线索。</td></tr>`;
    allLeads = [];
    renderStats([]);
  } finally {
    loadButton.disabled = false;
    loadButton.textContent = "加载线索";
  }
}

function applyFilters() {
  currentFilter.query = searchInput.value;
  currentFilter.service = serviceFilter.value;
  renderTable(getFilteredLeads());
}

function toCsvValue(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const leads = getFilteredLeads();
  const headers = ["编号", "提交时间", "服务类型", "公司", "联系人", "电话", "微信", "城市", "项目时间", "人数", "预算", "需求"];
  const rows = leads.map((lead) => [
    lead.id,
    lead.createdAt,
    lead.serviceType,
    lead.companyName,
    lead.contactName,
    lead.phone,
    lead.wechat,
    lead.city,
    lead.eventDate,
    lead.attendees,
    lead.budget,
    lead.description
  ]);
  const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sunyun-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

loadButton?.addEventListener("click", loadLeads);
exportButton?.addEventListener("click", exportCsv);
tokenInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadLeads();
  }
});
searchInput?.addEventListener("input", applyFilters);
serviceFilter?.addEventListener("change", applyFilters);

if (tokenInput.value) {
  loadLeads();
}
