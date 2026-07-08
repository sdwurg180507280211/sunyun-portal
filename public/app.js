const header = document.querySelector(".site-header");
const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const form = document.querySelector("#leadForm");
const result = document.querySelector("#formResult");

const contactEmail = "service@sunheyun.example";

window.addEventListener("scroll", () => {
  header?.setAttribute("data-elevated", String(window.scrollY > 24));
});

function toggleMobileNav(open) {
  if (!mobileNavToggle || !mobileNav) return;
  const isOpen = open !== undefined ? open : mobileNavToggle.getAttribute("aria-expanded") !== "true";
  mobileNavToggle.setAttribute("aria-expanded", String(isOpen));
  mobileNav.classList.toggle("open", isOpen);
}

mobileNavToggle?.addEventListener("click", () => toggleMobileNav());

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleMobileNav(false));
});

document.addEventListener("click", (event) => {
  if (!mobileNav?.classList.contains("open")) return;
  if (!mobileNav.contains(event.target) && !mobileNavToggle.contains(event.target)) {
    toggleMobileNav(false);
  }
});

function formDataToObject(formData) {
  return Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
  );
}

function buildSummary(payload, response) {
  return [
    `需求编号：${response.id}`,
    `项目类型：${payload.serviceType}`,
    `客户单位：${payload.companyName || "未填写"}`,
    `联系人：${payload.contactName}`,
    `电话：${payload.phone}`,
    `微信：${payload.wechat || "未填写"}`,
    `城市：${payload.city || "未填写"}`,
    `期望上线时间：${payload.eventDate || "未填写"}`,
    `使用人数/数据规模：${payload.attendees || "未填写"}`,
    `预算范围：${payload.budget || "暂不确定"}`,
    `需求描述：${payload.description}`
  ].join("\n");
}

function renderResult(state, title, message, actions = "") {
  result.innerHTML = `
    <div class="result-card" data-state="${state}">
      <div>
        <strong>${title}</strong>
        <span>${message}</span>
      </div>
      ${actions ? `<div class="result-actions">${actions}</div>` : ""}
    </div>
  `;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector(".submit-button");
  const payload = formDataToObject(new FormData(form));

  if (!payload.consent) {
    renderResult("error", "请确认信息保存授权", "需要获得授权后才能保存并联系项目需求。");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "正在提交";

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, source: "homepage-software-intake" })
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      renderResult("error", "提交失败", data.message || "请稍后再试。");
      return;
    }

    const summary = buildSummary(payload, data);
    localStorage.setItem("sunyun:lastLead", JSON.stringify({ ...payload, id: data.id, createdAt: new Date().toISOString() }));
    renderResult(
      "success",
      `已收到，编号 ${data.id}`,
      `${data.nextStep}。你也可以保留一份需求摘要，便于后续沟通。`,
      `
        <button class="button secondary" type="button" id="copySummaryButton">复制摘要</button>
        <a class="button secondary" href="mailto:${contactEmail}?subject=${encodeURIComponent(`软件项目需求 ${data.id}`)}&body=${encodeURIComponent(summary)}">邮件确认</a>
      `
    );
    document.querySelector("#copySummaryButton")?.addEventListener("click", async () => {
      await copyText(summary);
      document.querySelector("#copySummaryButton").textContent = "已复制";
    });
    form.reset();
  } catch (error) {
    renderResult("error", "提交失败", "当前网络或服务异常，请稍后重试。");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "提交需求";
  }
});
