# VEYO — Behavioral Credit Infrastructure for Invisible India

> Turning behavioral signals into financial identity for 450M+ gig workers

---

##  What is VEYO?

India has 450 million gig workers — auto drivers, delivery partners, kiranas, 
domestic workers. They earn regularly, pay rent on time, fuel their vehicles 
weekly. But when they walk into a bank, they get rejected.

**No salary slip. No ITR. Invisible to CIBIL.**

VEYO fixes this by aggregating real behavioral signals into a portable 
**TrustScore** that unlocks formal credit, government schemes, and gives 
workers a financial identity they actually own.

---

##  The Problem in Numbers

| Metric | Value |
|--------|-------|
| Informal economy size | ₹87 lakh crore |
| Workers invisible to credit | 450M+ |
| Credit gap | ₹25 lakh crore |
| Traditional NBFC NPA | 8.2% |
| VEYO behavioral model NPA | 0.3% |
| Traditional underwriting time | 3 months |
| VEYO underwriting time | 4.2 minutes |

---

##  Features

###  For Workers
- **TrustScore Engine** — weighted credit score from 5 behavioral signals
- **Financial Health Report** — income trends, savings rate, expense breakdown
- **Credit Health Dashboard** — score simulator, improvement roadmap
- **Loan Marketplace** — 6 NBFC/P2P partners, real-time applications
- **Identity Wallet** — W3C Verifiable Credential + Polygon Soulbound Token
- **Voice Assistant** — Hindi + English guidance via Web Speech API
- **Transaction History** — 3 months via Setu AA, platform-aware

###  For Lenders
- **Verification Queue** — behavioral score + signal breakdown per applicant
- **Live Applications** — Supabase Realtime push, zero refresh needed
- **Portfolio Analytics** — tier distribution, NPA tracking, disbursement data
- **Market Intelligence** — real RBI/NPCI/MOSPI data
- **AI Underwriting Advisor** — Claude-powered, role-aware

###  For Government
- **Scheme Tracker** — PM SVANidhi, MUDRA, Stand-Up India, PMEGP live data
- **Eligibility Calculator** — enter income + occupation → matched schemes
- **State Analytics** — 10 states, drill down, launch enrollment drives
- **Disbursal Simulator** — impact projection across priority states
- **Live Signal Feed** — real-time AA/ONDC/GSTN events

---

##  TrustScore — How It Works

Score is computed from 5 weighted behavioral signals:

| Signal | Weight | Source |
|--------|--------|--------|
| UPI Transactions | 28 pts | RBI Account Aggregator / Setu |
| Aadhaar eKYC | 22 pts | UIDAI Sandbox |
| Gig Platform Data | 20 pts | ONDC / Platform API |
| GST Filing History | 18 pts | GSTN API |
| Utility Bills | 12 pts | BESCOM / BSNL |

**Score Bands:**
- 0–40 → Building
- 40–60 → Fair (₹5K–20K eligible)
- 60–75 → Good (₹20K–60K eligible)
- 75–100 → Excellent (₹60K–2L eligible)

---

##  Identity Layer

### W3C Verifiable Credential
- JSON-LD format following W3C VC specification
- Ed25519 cryptographic proof
- Contains TrustScore, platform, income band, connected signals
- Downloadable as `.json` — worker owns it permanently

### Polygon Soulbound Token (SBT)
- ERC-721 with transfer functions disabled
- Non-transferable — bound to worker's wallet forever
- No platform can revoke your work history
- Stored on Polygon Mumbai Testnet
- Verifiable on PolygonScan

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Supabase (PostgreSQL + Realtime + Edge Functions) |
| Auth | Supabase Auth (Phone OTP via SMS) |
| AI | Anthropic Claude API (via Edge Function — key never in frontend) |
| Blockchain | Polygon EVM — Soulbound Token (ERC-721) |
| Identity | W3C Verifiable Credentials spec |
| Financial Data | Setu AA JSON spec (v1.1.2) |
| Commerce | ONDC webhook integration |
| Voice | Web Speech API (hi-IN + en-IN) |
| Styling | Pure CSS-in-JS with DM Sans + Syne + DM Mono |

---

##  Database Schema

```sql
user_sessions      -- phone, role, logged_in_at, auth_user_id
workers            -- name, platform, city, income_range, trust_score, consents
signal_connections -- worker_id, signal_key, connected_at
loan_applications  -- worker_id, lender, amount, rate, status
notifications      -- recipient_id, type, title, body, read
sbt_tokens         -- worker_id, token_id, tx_hash, metadata
```

---

## ⚡ Supabase Edge Functions
