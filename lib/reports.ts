export const reports = {
  "wazuh-lab": {
    title: "Wazuh SIEM Attack & Defense Lab",
    type: "Controlled lab · Training overview",
    summary:
      "A practical lab connecting web attack simulation to SIEM monitoring, evidence analysis, and remediation.",
    sections: [
      {
        heading: "Environment & objective",
        body: "A controlled multi-VM environment used for web attack simulation and defensive monitoring. Wazuh collected logs and alerts for investigating simulated activity.",
      },
      {
        heading: "Evidence & investigation",
        body: "Apache logs, Bash history, and Wazuh alerts were correlated to reconstruct attack timelines and identify suspicious activity.",
      },
      {
        heading: "Detection & validation",
        body: "Basic detection logic was created and tested for SQL injection, XSS, command injection, and suspicious file uploads. Mitigations were retested and lab changes tracked with Git.",
      },
    ],
    note: "This is a summary of the training and project work described in my CV. It does not include a full evidence pack or claim production incident-response outcomes.",
  },
  "phishing-investigation": {
    title: "Phishing Investigation",
    type: "Learning note · Investigation workflow",
    summary:
      "An outline for approaching suspicious messages and documenting indicators for further investigation.",
    sections: [
      {
        heading: "Preserve the evidence",
        body: "Record the reported message and relevant metadata without opening untrusted links or attachments. Preserve originals for analysis.",
      },
      {
        heading: "Inspect and correlate",
        body: "Review sender details, headers, link destinations, and available indicators in an isolated analysis workflow. Correlate findings with relevant logs.",
      },
      {
        heading: "Document the outcome",
        body: "Separate observed evidence from assumptions. Record indicators, investigation limits, and recommended response actions.",
      },
    ],
    note: "This existing portfolio topic is presented as a learning workflow, not a completed real-world incident case. No customer evidence or incident outcomes are claimed.",
  },
} as const;
