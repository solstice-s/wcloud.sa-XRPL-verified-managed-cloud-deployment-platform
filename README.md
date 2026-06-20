# wcloud.sa Platform

The managed cloud platform for Saudi SMEs and founders. Every deployment is verified on the XRP Ledger.

**Live:** [platform.wcloud.sa](https://platform.wcloud.sa)

---

## Overview

wcloud.sa operates as the outsourced technical infrastructure team for Saudi businesses. Clients connect their GitHub repository, the platform provisions cloud resources automatically, and every deployment event is permanently recorded on the XRP Ledger as a tamper-proof audit trail and a verifiable certificate of delivery.

**You deploy. We take control.**

---

## Key Capabilities

* **One-click deployment.** Clients connect GitHub, select a repository, and the application is provisioned to the cloud within seconds.
* **Fully managed infrastructure.** The platform handles resource provisioning, DNS, SSL, monitoring, and scaling on behalf of the client.
* **On-chain audit trail.** Every deployment, configuration change, and health check is written immutably to the XRP Ledger.
* **Verifiable deployment certificate.** Each completed deployment is issued an NFT certificate that any third party can validate independently.
* **Client dashboard.** Returning clients view a full history of past deployments along with their on-chain verification records.
* **Regulatory readiness.** The platform produces audit logs aligned with NCA, CITC, SAMA, and PDPL requirements out of the box.

---

## Why XRPL

### The problem we address

Saudi businesses are increasingly required to prove what happened in their IT systems, when it happened, and that the record has not been altered. Regulators, investors, acquirers, insurers, and auditors all demand this level of evidence. The standard answer today is screenshots, emails, and exported logs, none of which are independently verifiable.

wcloud.sa replaces those records with entries on a public ledger that cannot be modified by anyone, including the platform operator, the client, or third parties.

### How XRPL is used

The XRP Ledger is used exclusively as a verification layer. The platform writes deployment events as transaction memos and issues deployment certificates as NFTs. No cryptocurrency is purchased, held, sold, or transferred on behalf of the client. No client ever interacts with a wallet, token, or balance.

Because no monetary value moves, the activity sits outside the scope of SAMA cryptocurrency-payment restrictions.

### Why the XRP Ledger specifically

* **Cost-efficient.** Each on-chain record costs a fraction of a halala.
* **High-performance.** Transactions finalize within a few seconds.
* **Mature NFT standard (XLS-20).** Verifiable deployment certificates are issued natively without custom smart contracts.
* **Stable and established.** The ledger has operated continuously since 2012 with no security incidents.
* **Predictable surface area.** Built-in transaction types remove the risk profile associated with custom smart contract code.

### Why this matters to businesses

1. **Regulatory compliance.** NCA, CITC, SAMA, and PDPL require immutable IT audit logs. The platform produces them automatically.
2. **Due diligence readiness.** Investors and acquirers can verify a company's infrastructure history independently and instantly.
3. **Dispute resolution.** A neutral, public timestamp replaces back-and-forth between provider and client.
4. **Insurance and liability.** Cyber insurance claims and breach investigations require tamper-proof activity records, which clients have by default.
5. **Brand differentiation.** Independent verifiability is a credibility signal that competitors cannot easily replicate.

### How compliance is maintained

The XRP Ledger is a global, public network. The platform is transparent about what does and does not leave Saudi Arabia.

| Concern | Status |
|---|---|
| Does money cross borders? | No. No monetary value is transferred. |
| Is personal data sent abroad? | No. No personally identifiable information is written on-chain. |
| Is client business data sent abroad? | No. Code, databases, and customer data remain in Azure UAE and Saudi regions. |
| Are credentials on-chain? | No. All secrets remain in Azure Key Vault. |
| What is written on-chain? | A public deployment receipt only: project name, timestamp, repository URL, and status. |
| SAMA cryptocurrency-payment restrictions? | Not applicable. No payments are processed. |
| PDPL personal data law? | Compliant. No personal data is written on-chain. |
| CITC data localization rules? | Compliant. Only public business metadata is broadcast. |

### The client experience

The client interacts with a standard cloud dashboard showing deployments, statuses, and URLs. There is no mention of tokens, wallets, or balances. The verification layer operates silently in the background, much like an SSL certificate does today.

---

## Architecture

```
Client
  |
  v  GitHub OAuth
platform.wcloud.sa  (React + Vite frontend on Azure Static Web Apps)
  |
  |--> Azure Functions API
  |       |-- /api/auth-github   GitHub OAuth callback
  |       |-- /api/repos         List user repositories
  |       |-- /api/deploy        Provision cloud infrastructure
  |       |__ /api/deployments   List client deployment history
  |
  |--> Azure ARM API             Provisions Static Web Apps per client
  |
  |__> XRP Ledger
          |-- AccountSet memos    Audit trail events
          |__ NFTokenMint         Deployment certificate
```

### Current Implementation

The stack below reflects the current production deployment. Multi-cloud and multi-provider support are part of the roadmap.

* **Frontend:** React 19, Vite 5
* **Backend:** Azure Functions (Node.js 20)
* **Cloud:** Azure (Static Web Apps, DNS Zone, Service Principal)
* **Verification layer:** XRP Ledger (xrpl.js)
* **Authentication:** GitHub OAuth

---

## Local Development

```bash
# Frontend
npm install
npm run dev          # http://localhost:5174

# API (in a second terminal)
cd api
npm install
func start           # http://localhost:7071
```

### Required Environment Variables

Refer to `.env.example` and `api/local.settings.json` for the full configuration:

* `VITE_GITHUB_CLIENT_ID`. Public OAuth client identifier.
* `GITHUB_CLIENT_SECRET`. Server-only OAuth secret.
* `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_SUBSCRIPTION_ID`. Service principal credentials for the Azure Resource Manager API.
* `AZURE_RESOURCE_GROUP`, `AZURE_LOCATION`. The target location for client deployments.

---

## Deployment Workflow

1. The client signs in through GitHub OAuth on platform.wcloud.sa.
2. The platform requests repository read access along with workflow integration scope.
3. The client selects a repository.
4. The `/api/deploy` endpoint detects the framework and package manager, provisions a tagged Azure Static Web App, and links the repository for automated builds.
5. In parallel, the frontend funds a dedicated XRPL wallet, writes three audit events, and mints a deployment certificate.
6. The client receives the live URL, the pending custom domain status, and links to verify each on-chain record.
7. On subsequent visits, the dashboard lists all previous deployments, queried from Azure resource tags.

---

## Roadmap

* Production deployment on XRPL Mainnet.
* Container Apps support for repositories with a Dockerfile.
* Automated custom domain configuration through Azure DNS.
* Managed database provisioning (PostgreSQL, Redis).
* Internal cost and margin dashboard for the operations team.
* Multi-region deployment options.

---

## License

Proprietary. Copyright 2026 wcloud.sa. All rights reserved.
