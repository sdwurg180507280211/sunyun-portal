export const navigation = [
  { label: "解决方案", href: "#solutions" },
  { label: "服务对象", href: "#audiences" },
  { label: "技术与交付", href: "#delivery" },
  { label: "场景实践", href: "#scenarios" },
  { label: "关于云医荟", href: "#about" },
] as const;

export const deliverables = [
  "需求蓝图",
  "产品原型",
  "权限矩阵",
  "接口清单",
  "验收清单",
] as const;

export const audiences = [
  {
    index: "01",
    eyebrow: "PHARMA ENTERPRISE",
    title: "药品生产企业",
    description: "项目协同、资料与知识管理、商业运营数据、客户与活动流程工具。",
  },
  {
    index: "02",
    eyebrow: "MEDICAL INSTITUTION",
    title: "医疗机构",
    description: "院内非诊疗业务流程、运营数据、台账管理和知识协作工具。",
  },
  {
    index: "03",
    eyebrow: "PHARMA COMMERCE",
    title: "医药商业公司",
    description: "客户与渠道协同、经营数据、订单库存信息连接和业务看板。",
  },
] as const;

export const solutions = [
  {
    index: "01",
    eyebrow: "BUSINESS SOFTWARE",
    icon: "▦",
    title: "医药业务系统",
    description:
      "围绕客户、项目、资料、审批和运营等场景，建设角色清晰、流程可追踪的业务系统。",
  },
  {
    index: "02",
    eyebrow: "DATA PLATFORM",
    icon: "◫",
    title: "数据平台与分析",
    description:
      "梳理多源数据、指标口径与权限边界，建设查询、分析、看板与数据服务能力。",
  },
  {
    index: "03",
    eyebrow: "AI WORKFLOW",
    icon: "✦",
    title: "AI 工作流工具",
    description:
      "将 AI 用于资料整理、知识检索、内容辅助和流程自动化，并为关键结果设置人工复核节点。",
  },
  {
    index: "04",
    eyebrow: "INTEGRATION",
    icon: "⇄",
    title: "系统集成与持续服务",
    description:
      "根据已有系统、接口条件、数据质量和授权范围评估连接方式，并提供上线支持与持续迭代。",
  },
] as const;

export const dataFlow = [
  {
    eyebrow: "INPUT",
    title: "多源业务信息",
    items: ["现有系统与表格", "客户、项目与渠道记录", "授权知识与内容资料"],
  },
  {
    eyebrow: "STRUCTURE",
    title: "统一与治理",
    items: ["角色权限与责任边界", "指标口径与接口条件", "AI 结果人工复核节点"],
  },
  {
    eyebrow: "OUTPUT",
    title: "可用数字能力",
    items: ["业务系统与协作工具", "专题分析与经营视图", "可验收、可持续迭代"],
  },
] as const;

export const deliverySteps = [
  {
    index: "01",
    title: "场景与边界",
    description: "确认角色、流程、目标、数据类型和适用要求。",
  },
  {
    index: "02",
    title: "蓝图与原型",
    description: "形成需求蓝图、交互原型、权限矩阵和阶段范围。",
  },
  {
    index: "03",
    title: "研发与验证",
    description: "按阶段演示、持续联调并对照验收清单确认。",
  },
  {
    index: "04",
    title: "上线与迭代",
    description: "完成部署、培训与问题跟踪，按约定持续演进。",
  },
] as const;

export const scenarios = [
  {
    index: "01",
    title: "药企业务协同平台",
    description:
      "统一客户、项目、资料、活动与跟进记录，让协作过程可见，信息沉淀可用。",
  },
  {
    index: "02",
    title: "非诊疗运营工具",
    description: "面向医疗机构的运营流程、台账和知识协作。",
  },
  {
    index: "03",
    title: "经营与渠道协同",
    description: "连接客户、渠道和经营数据，形成统一业务视图。",
  },
] as const;

export const trustIntro = {
  title: "将信息保护纳入项目设计",
  description:
    "根据项目用途共同确认数据类型、角色权限、部署方式、日志与备份要求。",
} as const;

export const trustPrinciples = [
  { index: "01", title: "最小权限", description: "角色与访问边界" },
  { index: "02", title: "关键留痕", description: "重要操作可追踪" },
  { index: "03", title: "人工复核", description: "AI 关键结果保留确认节点" },
  { index: "04", title: "备份恢复", description: "明确数据保护策略" },
] as const;
