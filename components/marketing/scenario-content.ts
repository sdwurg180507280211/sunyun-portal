export const collaborationMetrics = [
  {label: "进行中项目", value: "08", note: "按阶段推进"},
  {label: "待审批事项", value: "05", note: "责任人已明确"},
  {label: "资料完成度", value: "良好", note: "按清单持续更新"},
] as const;

export const collaborationProjects = [
  {name: "项目 A", stage: "方案确认", progress: "72", owner: "项目组一"},
  {name: "项目 B", stage: "联调验证", progress: "58", owner: "项目组二"},
  {name: "项目 C", stage: "上线准备", progress: "86", owner: "项目组三"},
] as const;

export const collaborationFollowUp = {
  label: "最近跟进",
  title: "资料清单已更新",
  detail: "下一步确认接口条件与验收口径",
  status: "待确认",
} as const;

export const operationsLedger = [
  {title: "运营事项 01", owner: "运营组", deadline: "本周", status: "处理中"},
  {title: "运营事项 02", owner: "协作组", deadline: "下周", status: "待确认"},
  {title: "知识资料更新", owner: "内容组", deadline: "持续", status: "正常"},
] as const;

export const commerceAnalysis = {
  summary: [
    {label: "订单协同", value: "稳定"},
    {label: "库存状态", value: "可用"},
  ],
  channels: [
    {label: "核心渠道", value: 78},
    {label: "区域渠道", value: 61},
    {label: "协作渠道", value: 43},
  ],
  attention: "2 项经营信息待复核",
} as const;
