import type {CSSProperties} from "react";
import {commerceAnalysis} from "@/components/marketing/scenario-content";

export function ScenarioAnalysis() {
  return (
    <div aria-label="医药商业经营分析模拟界面" className="scenario-analysis">
      <div className="scenario-panel-heading">
        <div>
          <small>COMMERCE</small>
          <strong>经营视图</strong>
        </div>
        <span>结构分析</span>
      </div>

      <div className="scenario-analysis-summary">
        {commerceAnalysis.summary.map((item) => (
          <article key={item.label}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
          </article>
        ))}
        <svg aria-hidden="true" className="scenario-sparkline" viewBox="0 0 160 48">
          <path d="M3 39C22 35 28 17 47 23S74 38 91 20s34-9 45-15 17 4 21 0" fill="none" />
        </svg>
      </div>

      <div aria-label="匿名渠道结构" className="scenario-channel-list">
        {commerceAnalysis.channels.map((channel) => (
          <div key={channel.label}>
            <span>{channel.label}</span>
            <i>
              <b style={{"--scenario-channel": channel.value} as CSSProperties} />
            </i>
          </div>
        ))}
      </div>
      <p className="scenario-attention">{commerceAnalysis.attention}</p>
    </div>
  );
}
