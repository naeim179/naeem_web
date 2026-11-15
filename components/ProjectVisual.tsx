export default function ProjectVisual({ kind }: { kind: string }) {
  if (kind === "platform")
    return (
      <div className="project-visual platform-art" aria-hidden="true">
        <div className="art-label">
          YOUR WAY ACADEMY <span>LEARNING, CONNECTED.</span>
        </div>
        <div className="platform-window">
          <div className="window-top">
            <i />
            <i />
            <i />
            <span>your learning workspace</span>
          </div>
          <div className="window-content">
            <div className="window-sidebar">
              <b>
                YW<span>.</span>
              </b>
              <span className="sidebar-line active" />
              <span className="sidebar-line" />
              <span className="sidebar-line" />
            </div>
            <div className="window-dashboard">
              <small>KEEP MOVING FORWARD</small>
              <strong>
                A little progress.
                <br />
                Every day.
              </strong>
              <div className="lesson-preview">
                <span className="play-symbol">▷</span>
                <span>
                  Learning in motion<small>YOUR NEXT CHAPTER</small>
                </span>
              </div>
              <div className="progress-line">
                <span />
              </div>
              <div className="mini-cards">
                <span>
                  01<small>Learn</small>
                </span>
                <span>
                  02<small>Practice</small>
                </span>
                <span>
                  03<small>Grow</small>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="art-foot">
          <span>APPLICATION ↔ CLOUD ↔ PAYMENTS</span>
          <span>01 / FULL-STACK</span>
        </div>
      </div>
    );
  if (kind === "qr")
    return (
      <div className="project-visual qr-art" aria-hidden="true">
        <div className="art-label">
          QRSHIELD <span>LOOK BEYOND THE CODE.</span>
        </div>
        <div className="qr-composition">
          <div className="qr-grid">
            {Array.from({ length: 81 }, (_, i) => (
              <i
                key={i}
                className={
                  (i * 7 + Math.floor(i / 9) * 3) % 11 < 6 ? "filled" : ""
                }
              />
            ))}
            <span className="scan-line" />
          </div>
          <div className="scan-result">
            <span className="small-dot" /> PAYLOAD ANALYZED
            <div>
              Clarity before
              <br />
              the next click.
            </div>
            <small>Decode → Analyze → Explain</small>
          </div>
        </div>
        <div className="art-foot">
          <span>RULE-BASED ANALYSIS</span>
          <span>02 / SECURITY TOOL</span>
        </div>
      </div>
    );
  return (
    <div className="project-visual security-art" aria-hidden="true">
      <div className="art-label">
        DETECTION LAB <span>FOLLOW THE EVIDENCE.</span>
      </div>
      <div className="signal-chart">
        <svg viewBox="0 0 600 200" fill="none">
          <path
            className="chart-guide"
            d="M0 50h600M0 100h600M0 150h600M100 0v200M200 0v200M300 0v200M400 0v200M500 0v200"
          />
          <path
            className="signal-line"
            d="m0 140 40-10 30 8 30-30 30 12 40-20 35 18 30-65 25 83 30-34 25 18 25-82 22 104 35-40 25 25 30-52 30 35 30-15 43 12"
          />
          <circle cx="365" cy="38" r="7" fill="currentColor" />
        </svg>
        <div className="event-tag">
          WEB EVENT DETECTED <span>Evidence → Timeline → Response</span>
        </div>
      </div>
      <div className="art-foot">
        <span>APACHE LOGS + WAZUH ALERTS</span>
        <span>03 / BLUE TEAM</span>
      </div>
    </div>
  );
}
