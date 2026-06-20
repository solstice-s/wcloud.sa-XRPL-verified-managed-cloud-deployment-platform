import * as xrpl from 'xrpl'

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233'
const EXPLORER_BASE = 'https://testnet.xrpl.org/transactions'

function toHex(str) {
  return Array.from(new TextEncoder().encode(str))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('')
}

export async function setupWallet() {
  const client = new xrpl.Client(TESTNET_URL)
  await client.connect()
  const result = await client.fundWallet()
  await client.disconnect()
  return result.wallet
}

export async function writeAuditEvent(wallet, eventData) {
  const client = new xrpl.Client(TESTNET_URL)
  await client.connect()

  const tx = {
    TransactionType: 'AccountSet',
    Account: wallet.address,
    Memos: [
      {
        Memo: {
          MemoData: toHex(JSON.stringify(eventData)),
          MemoType: toHex('wcloud.sa/audit'),
        },
      },
    ],
  }

  const prepared = await client.autofill(tx)
  const signed = wallet.sign(prepared)
  const result = await client.submitAndWait(signed.tx_blob)
  await client.disconnect()

  return {
    hash: result.result.hash,
    url: `${EXPLORER_BASE}/${result.result.hash}`,
  }
}

export async function mintDeploymentNFT(wallet, projectName, repoUrl) {
  const client = new xrpl.Client(TESTNET_URL)
  await client.connect()

  const metadata = {
    issuer: 'wcloud.sa',
    project: projectName,
    repo: repoUrl,
    deployed_at: new Date().toISOString(),
    platform: 'Azure Static Web Apps',
    certificate_type: 'Deployment Verification',
  }

  const tx = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    NFTokenTaxon: 0,
    Flags: 8,
    URI: toHex(JSON.stringify(metadata)),
    Memos: [
      {
        Memo: {
          MemoData: toHex('wcloud.sa Deployment Certificate'),
          MemoType: toHex('wcloud.sa/nft-certificate'),
        },
      },
    ],
  }

  const prepared = await client.autofill(tx)
  const signed = wallet.sign(prepared)
  const result = await client.submitAndWait(signed.tx_blob)
  await client.disconnect()

  return {
    hash: result.result.hash,
    url: `${EXPLORER_BASE}/${result.result.hash}`,
    metadata,
  }
}

export function shortHash(hash) {
  if (!hash) return ''
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`
}

function fromHex(hex) {
  try {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)))
    return new TextDecoder().decode(bytes)
  } catch (e) {
    return ''
  }
}

function parseMemo(tx) {
  const memo = tx?.Memos?.[0]?.Memo
  if (!memo) return null
  try {
    const data = fromHex(memo.MemoData || '')
    return JSON.parse(data)
  } catch (e) {
    return { raw: fromHex(memo?.MemoData || '') }
  }
}

export async function getWalletHistory(address) {
  if (!address) return { events: [], nft: null }

  const client = new xrpl.Client(TESTNET_URL)
  await client.connect()

  try {
    const response = await client.request({
      command: 'account_tx',
      account: address,
      limit: 50,
    })

    const events = []
    let nft = null

    for (const item of response.result.transactions) {
      const tx = item.tx_json || item.tx
      if (!tx) continue

      const hash = item.hash || tx.hash
      const url = `${EXPLORER_BASE}/${hash}`

      if (tx.TransactionType === 'NFTokenMint') {
        const meta = parseMemo(tx) || {}
        nft = {
          hash,
          url,
          metadata: meta,
        }
      } else if (tx.TransactionType === 'AccountSet') {
        const data = parseMemo(tx) || {}
        const labelMap = {
          deployment_started: 'Deployment Started',
          deployment_live: 'Deployment Live',
          health_check_passed: 'Health Check Passed',
        }
        events.push({
          hash,
          url,
          label: labelMap[data.event] || data.event || 'Audit Event',
          data,
          timestamp: data.timestamp || null,
        })
      }
    }

    events.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))

    return { events, nft, walletUrl: `https://testnet.xrpl.org/accounts/${address}` }
  } finally {
    await client.disconnect()
  }
}
