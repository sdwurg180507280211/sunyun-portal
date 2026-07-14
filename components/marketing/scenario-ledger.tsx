import {operationsLedger} from "@/components/marketing/scenario-content";

export function ScenarioLedger() {
  return (
    <div aria-label="医疗机构运营台账模拟界面" className="scenario-ledger">
      <div className="scenario-panel-heading">
        <div>
          <small>OPERATIONS</small>
          <strong>事项台账</strong>
        </div>
        <span>本周视图</span>
      </div>
      <div className="scenario-ledger-list">
        {operationsLedger.map((item) => (
          <article key={item.title}>
            <span aria-hidden="true" className="scenario-ledger-marker" />
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.owner} · {item.deadline}
              </small>
            </div>
            <b>{item.status}</b>
          </article>
        ))}
      </div>
    </div>
  );
}
