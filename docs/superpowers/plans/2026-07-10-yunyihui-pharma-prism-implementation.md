# 云医荟「医药棱镜」门户 Implementation Plan

实施状态：生产代码已按 Tasks 1–7 完成，Task 8 由 PR CI、运行时链路与发布后检查验收。原始逐步计划保留在提交 `0ec96a03ad0cb2ec77ef5e344ea271cf3f920ec0` 中。

本次交付保持 Next.js 16 App Router、React 19、HeroUI v3、Tailwind CSS v4、SQLite、管理员认证、Docker 服务名、镜像名、数据目录和历史线索结构不变；仅重构品牌、门户内容、视觉系统、商务咨询和用户可见后台文案。

## 已完成任务

- [x] Task 1：建立品牌与公开文案契约
- [x] Task 2：更新 metadata、Organization JSON-LD、站点图标、Open Graph 图与健康标识
- [x] Task 3：建立医药门户内容契约
- [x] Task 4：实现棱镜图形、品牌令牌与渐进增强 Reveal 动效
- [x] Task 5：组装完整医药棱镜首页
- [x] Task 6：重构商务咨询、服务端校验、网络错误处理与隐私说明
- [x] Task 7：清理旧品牌并更新后台、CSV、package 描述和 README
- [ ] Task 8：全量 CI、运行时咨询链路、响应式、键盘与 reduced-motion 验收

## 完成门禁

- `npm run typecheck`
- `npm test`
- `npm run build`
- standalone + SQLite 健康检查
- 生产 Docker 镜像构建
- 合成咨询提交、管理员登录与后台读取
- 公开页面无旧品牌、虚构客户、虚构效果数字或个人医疗建议
- 六个目标视口无横向溢出，键盘焦点可见，reduced-motion 显示最终状态

完整原始计划与精确代码步骤可通过上述原始提交查看。
