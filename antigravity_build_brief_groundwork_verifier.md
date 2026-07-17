## AGENT TASK 

Build a single-page web application called **Groundwork Verifier** — a prototype of an internal tool for litigation-consulting analysts that uses an LLM to verify factual claims in a draft expert report against the matter's source documents.

### Context for design decisions
The users are analysts at an economic consulting firm preparing expert reports for litigation. Every factual claim in a report must be supported by a specific source, and every number must match its exhibit. The tool's philosophy: **the AI verifies, the human decides.** Every AI output must be traceable and resolvable by the analyst. Nothing is auto-accepted.

### Tech stack
- Vite + React, single-page app. Plain CSS or Tailwind. No database — all state in memory, fictional data bundled as JSON.
- A tiny Node/Express server (or Vite dev-server middleware) with one endpoint, `POST /api/verify`, which calls the LLM. The API key lives in a `.env` file server-side and is never exposed to the client.
- An `APP_MODE` env flag: `LIVE` calls the LLM; `MOCK` returns the bundled pre-computed verification JSON after a simulated 2-second delay. The UI must be identical in both modes.

### LLM integration
- Provider: [Gemini ; implement behind a single `verifyClaims(section, sources)` function so the provider is swappable].
- One call per verification run. Prompt the model with: the draft section text, the full text of all source documents (they are short), and instructions to return **strict JSON only** matching this schema:

```json
{
  "claims": [
    {
      "id": "c1",
      "claim_text": "exact sentence or clause from the draft",
      "claim_type": "factual | numeric | citation",
      "cited_source": "source id the draft cites, or null",
      "best_source": "source id that best supports the claim, or null",
      "status": "supported | misgrounded | unsupported | numeric_mismatch",
      "evidence_quote": "verbatim quote from the source that supports or contradicts, or null",
      "explanation": "one sentence: why this status",
      "confidence": "high | medium | low"
    }
  ]
}
```
- Definitions the prompt must include: **supported** = cited source contains evidence for the claim; **misgrounded** = the cited source is real but does not support the claim (even if another source does — report it in best_source); **unsupported** = no bundled source supports it; **numeric_mismatch** = a number in the draft conflicts with the number in the source.
- Parse defensively: strip markdown fences, validate against the schema, and if parsing fails show a friendly error state with a "Retry" button — never a blank screen.

### Fictional matter data (bundle as JSON; invent nothing beyond this)
Matter: *In re Meridian Semiconductor Corp. Securities Litigation* (entirely fictional).

**Draft section** (`draft.json`) — "Section VII: Damages from the March 12 Corrective Disclosure," ~10 sentences containing exactly these claims:
1. Meridian's stock fell 18.4% on March 12, 2024, from $64.20 to $52.39. *(cites Ex. 14)*
2. The decline was statistically significant at the 1% level per the event study. *(cites Ex. 14)*
3. Trading volume on March 12 was 6.2× the prior 90-day average. *(cites Ex. 15)*
4. No confounding company-specific news was released that day. *(cites Ex. 16)*
5. Analyst reaction attributed the decline to the restatement announcement. *(cites Ex. 17)*
6. Estimated aggregate damages are $412 million. *(cites Ex. 18)*
7. The S&P Semiconductor index declined 0.3% the same day. *(cites Ex. 14)*
8. Meridian's CFO had certified the prior financials under SOX §302. *(cites Ex. 19)*
9. Institutional investors held 71% of the float during the class period. *(cites Ex. 20)*
10. Short interest was at a 52-week high in the week before disclosure. *(cites Ex. 16)*

**Source documents** (`sources.json`) — eight short exhibits (150–300 words each of plausible content): Ex. 14 event-study memo; Ex. 15 trading-volume table; Ex. 16 news-sweep memo; Ex. 17 analyst-report excerpts; Ex. 18 damages model output; Ex. 19 SEC filing excerpt; Ex. 20 ownership analysis; Ex. 21 deposition excerpt (uncited — a distractor).

**Seed exactly these four errors** so verification produces a compelling mix (and hard-code the same outcomes in the MOCK results):
- Claim 6 → **numeric_mismatch**: Ex. 18 says $421 million, draft says $412 million (a transposition — the classic real-world error).
- Claim 4 → **misgrounded**: Ex. 16 actually notes a same-day product recall announcement, contradicting "no confounding news." This is the money moment of the demo.
- Claim 10 → **unsupported**: no exhibit mentions short interest (Ex. 16 discusses news only).
- Claim 9 → **misgrounded (recoverable)**: draft cites Ex. 20 but the 71% figure actually appears in Ex. 19; best_source = Ex. 19.
All other claims verify as supported.

### UI (three-panel workspace)
- **Header**: matter name, section title, mode badge (LIVE/MOCK), and a primary button "Verify section". While running: progress state "Extracting claims → Matching sources → Checking support" (staged, not a bare spinner).
- **Left panel — Draft**: the section text. After verification, each claim is highlighted with a status color: green = supported, amber = unsupported, red = misgrounded, purple = numeric mismatch. Clicking a highlight selects that claim.
- **Center panel — Claims queue**: list of claim cards (status chip, claim text, confidence). Sorted problems-first. Filter chips by status.
- **Right panel — Evidence view**: for the selected claim, show claim text and the cited source side-by-side with the evidence_quote highlighted inside the source text, the model's one-sentence explanation, and resolution buttons: **Confirm fix needed**, **Accept as supported**, **Dismiss flag** (dismiss requires a one-line reason). Resolutions update the claim card and the draft highlight.
- **Footer — Verification summary + audit trail**: counts by status (e.g., "6 supported · 2 misgrounded · 1 unsupported · 1 numeric mismatch"), percent resolved, and a chronological audit log ("14:32 — Claim 6 numeric mismatch confirmed by analyst — note: 'fix to $421M per Ex. 18'"). Include an "Export audit log" button that downloads the log as JSON.

### Design direction
Quiet, credible, professional — this is litigation software, not a startup landing page. Neutral background, one restrained accent, a clear serif for the draft-document panel (it should feel like a report) and a clean sans for the UI. Status colors are the only vivid elements. No decorative animation; motion only for state changes (claim selection, resolution). Density over whitespace — analysts live in dense documents. Include an empty state before first run: "Load a draft section and verify every claim against the matter record."

### Milestones (execute in order, verify each before proceeding)
1. Scaffold app + bundled fictional data rendering in the three-panel layout, MOCK mode end-to-end working.
2. LIVE mode: server endpoint, LLM call, JSON parsing with validation and error state.
3. Resolution workflow + audit trail + export.
4. Polish pass: highlight interactions, filters, progress staging, keyboard focus states, then run the app, open it in the browser, and screenshot the full flow to confirm everything works.

### Acceptance criteria
- In MOCK mode, the full demo flow works offline with the four seeded errors appearing exactly as specified.
- In LIVE mode, a real LLM call returns and renders; a malformed response shows the retry state, not a crash.
- Every flag can be resolved, resolutions appear in the audit log, and the export downloads valid JSON.
- No API key in client code.


