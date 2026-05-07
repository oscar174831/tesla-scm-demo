# Stamping SCM Command Center V2

An interview-ready 3D web project built for a Tesla Supply Chain Manager, Stamping conversation.

V2 moves beyond a status tracker. It is a lightweight simulation cockpit that connects supplier research, public filing links, should-cost levers, tooling bottlenecks, capacity cover, quality risk, and recommended SCM actions. The 3D view is not decoration: the supplier flow, press speed, die-stage highlight, risk halo, and output flow change when the user changes supplier, scenario, material index, scrap/yield loss, logistics distance, or annual service volume.

![Desktop preview](./assets/desktop-preview.png)

## Why This Project

This role sits between design engineering, SIE, suppliers, planners, packaging, logistics, service quality, and collision/service operations. The project demonstrates the same operating style:

- Turn public supplier research into sourcing questions
- Compare quote versus should-cost instead of negotiating blindly
- Separate part price from tooling and capex
- Show how tooling delay, quote shock, and dimensional issues affect launch execution
- Translate supplier issues into SCM action plans and pressure questions
- Use coding and AI-style automation to make complex SCM work visible and faster

## Why It Is More Than Excel

Excel can track cost tables and milestone dates. This project shows the physical and causal side that a spreadsheet cannot communicate well:

- Supplier-to-press flow changes with selected supplier and capacity risk
- Die-stage blocks highlight the likely bottleneck
- Press behavior and output flow change with capacity, scrap, and launch scenario
- Risk halo intensity changes as cost gap, quality, capacity, and financial risk change
- Supplier filing links and pressure questions sit next to the live model

## Public Research Scope

The supplier examples are public benchmarks, not confidential Tesla supplier claims. They are included to show how an SCM candidate would research stamping-capable suppliers from public sources before a sourcing decision.

- Magna International: SEC EDGAR and annual report links
- Gestamp: annual information, corporate reports, sustainability reports
- Martinrea: investor relations and annual report links

## Open Locally

Open `index.html` in a browser, or use the included server:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:5178
```

## Interview Pitch

> I built a 3D Stamping SCM Command Center to show how I would bring coding and AI workflow thinking into this role. The app connects public supplier research, RFQ thinking, should-cost, tooling stages, capacity cover, and quality risk into one interactive view. My goal was not to create a pretty dashboard; it was to show how I would structure ambiguity, make supplier risk visible, and help SCM, SIE, engineering, planning, and quality move faster from facts to decisions.

## Files

- `index.html` - app shell
- `styles.css` - professional dark manufacturing UI
- `app.js` - 3D simulation, supplier research, should-cost model, and scenario logic
- `server.js` - zero-dependency local server
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow
- `INTERVIEW_PITCH.md` - short story and demo flow for the interview

## Note

This is a portfolio demo for interview preparation. It is not affiliated with or endorsed by Tesla.
