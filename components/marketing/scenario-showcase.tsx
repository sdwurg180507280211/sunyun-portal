import {scenarioDisclaimer, scenarios} from "@/components/marketing/content";
import {ScenarioAnalysis} from "@/components/marketing/scenario-analysis";
import {ScenarioDashboard} from "@/components/marketing/scenario-dashboard";
import {ScenarioLedger} from "@/components/marketing/scenario-ledger";
import {Reveal} from "@/components/marketing/reveal";

export function ScenarioShowcase() {
  const [collaboration, ledger, analysis] = scenarios;

  return (
    <section className="scroll-mt-20 bg-[var(--background)] py-16 lg:py-20" id="scenarios">
      <div className="site-shell-wide">
        <p className="section-kicker">04 · Scenario examples</p>
        <h2 className="section-title">从一个关键场景开始，连接真实业务链。</h2>
        <p className="section-copy mt-5">{scenarioDisclaimer}</p>

        <div className="scenario-showcase-grid mt-12">
          <Reveal>
            <article className="scenario-card scenario-card-main">
              <div className="scenario-card-copy">
                <p className="section-kicker">
                  SCENARIO {collaboration.index} · {collaboration.eyebrow}
                </p>
                <h3>{collaboration.title}</h3>
                <p>{collaboration.description}</p>
              </div>
              <ScenarioDashboard />
            </article>
          </Reveal>

          <div className="scenario-supporting-stack">
            <Reveal delay={80}>
              <article className="scenario-card scenario-card-supporting">
                <div className="scenario-card-copy">
                  <p className="section-kicker">
                    SCENARIO {ledger.index} · {ledger.eyebrow}
                  </p>
                  <h3>{ledger.title}</h3>
                  <p>{ledger.description}</p>
                </div>
                <ScenarioLedger />
                <span aria-hidden="true" className="scenario-card-number">
                  {ledger.index}
                </span>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="scenario-card scenario-card-supporting">
                <div className="scenario-card-copy">
                  <p className="section-kicker">
                    SCENARIO {analysis.index} · {analysis.eyebrow}
                  </p>
                  <h3>{analysis.title}</h3>
                  <p>{analysis.description}</p>
                </div>
                <ScenarioAnalysis />
                <span aria-hidden="true" className="scenario-card-number">
                  {analysis.index}
                </span>
              </article>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
