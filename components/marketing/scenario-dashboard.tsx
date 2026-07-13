import type {CSSProperties} from "react";
import {
  collaborationFollowUp,
  collaborationMetrics,
  collaborationProjects,
} from "@/components/marketing/scenario-content";

export function ScenarioDashboard() {
  return (
    <div aria-label="药企业务协同平台模拟工作台" className="scenario-dashboard">
      <div className="scenario-window-bar">
        <span>业务协同工作台</span>
        <span className="scenario-window-status">场景示意</span>
      </div>

      <div className="scenario-metric-grid">
        {collaborationMetrics.map((metric) => (
          <article className="scenario-metric" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>

      <div aria-label="匿名项目状态" className="scenario-project-list">
        <div className="scenario-project-heading">
          <span>项目</span>
          <span>阶段</span>
          <span>责任组</span>
        </div>
        {collaborationProjects.map((project) => (
          <article className="scenario-project-row" key={project.name}>
            <div>
              <strong>{project.name}</strong>
              <span aria-label={`${project.name}阶段进度`} className="scenario-progress-track">
                <i style={{"--scenario-progress": project.progress} as CSSProperties} />
              </span>
            </div>
            <span className="scenario-status-pill">{project.stage}</span>
            <span>{project.owner}</span>
          </article>
        ))}
      </div>

      <aside className="scenario-follow-up">
        <span>{collaborationFollowUp.label}</span>
        <strong>{collaborationFollowUp.title}</strong>
        <p>{collaborationFollowUp.detail}</p>
        <b>{collaborationFollowUp.status}</b>
      </aside>
    </div>
  );
}
