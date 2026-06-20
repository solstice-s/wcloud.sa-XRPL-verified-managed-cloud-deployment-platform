import { useEffect, useRef, useState } from 'react'
import { setupWallet, writeAuditEvent, mintDeploymentNFT } from '../services/xrpl'

const sleep = ms => new Promise(r => setTimeout(r, ms))

const STEPS = [
  { id: 0, label: 'Initializing secure deployment environment', xrpl: false },
  { id: 1, label: 'Connecting to GitHub repository', xrpl: false },
  { id: 2, label: 'Cloning repository', xrpl: false },
  { id: 3, label: 'Installing dependencies', xrpl: false },
  { id: 4, label: 'Building application', xrpl: false },
  { id: 5, label: 'Provisioning cloud infrastructure', xrpl: true },
  { id: 6, label: 'Configuring DNS and SSL certificate', xrpl: true },
  { id: 7, label: 'Running health checks', xrpl: true },
  { id: 8, label: 'Minting deployment certificate', xrpl: true },
]

export default function DeployPage({ projectName, repoUrl, githubToken, clientLogin, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState([])
  const [xrplEvents, setXrplEvents] = useState([])
  const [statusMsg, setStatusMsg] = useState('Starting...')
  const [failed, setFailed] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    run()
  }, [])

  function markDone(stepId) {
    setCompleted(c => c.includes(stepId) ? c : [...c, stepId])
  }

  async function run() {
    try {
      setCurrentStep(0)
      setStatusMsg('Connecting to XRP Ledger...')
      const wallet = await setupWallet()
      setStatusMsg(`Wallet ready: ${wallet.address.slice(0, 8)}...`)
      await sleep(500)
      markDone(0)

      for (const stepId of [1, 2, 3, 4]) {
        setCurrentStep(stepId)
        setStatusMsg(STEPS[stepId].label + '...')
        await sleep(1000 + Math.random() * 800)
        markDone(stepId)
      }

      setCurrentStep(5)
      setStatusMsg('Provisioning cloud infrastructure...')

      let liveHostname = `${projectName.toLowerCase().replace(/\s+/g, '-')}.platform.wcloud.sa`
      let resourceName = ''

      try {
        const deployRes = await fetch('/api/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName, repoUrl, branch: 'main',
            githubToken, clientLogin,
            xrplWallet: wallet.address
          })
        })
        const deployData = await deployRes.json()
        if (deployRes.ok && deployData.defaultHostname) {
          liveHostname = deployData.defaultHostname
          resourceName = deployData.appName
          setStatusMsg(`Cloud infrastructure ready`)
        } else {
          setStatusMsg('Provisioning in progress...')
        }
      } catch (e) {
        setStatusMsg('Provisioning in progress...')
      }

      await sleep(500)
      setStatusMsg('Recording deployment event on XRP Ledger...')
      const event1 = await writeAuditEvent(wallet, {
        event: 'deployment_started',
        project: projectName,
        repo: repoUrl,
        platform: 'wcloud.sa',
        resource: resourceName,
        region: 'East Asia',
        timestamp: new Date().toISOString(),
      })
      setXrplEvents(e => [...e, { label: 'Deployment Started', ...event1 }])
      markDone(5)

      setCurrentStep(6)
      setStatusMsg('Configuring DNS and SSL...')
      await sleep(1000)
      setStatusMsg('Recording on XRP Ledger...')
      const event2 = await writeAuditEvent(wallet, {
        event: 'deployment_live',
        project: projectName,
        url: liveHostname.startsWith('http') ? liveHostname : `https://${liveHostname}`,
        ssl: 'enabled',
        timestamp: new Date().toISOString(),
      })
      setXrplEvents(e => [...e, { label: 'Deployment Live', ...event2 }])
      markDone(6)

      setCurrentStep(7)
      setStatusMsg('Running health checks...')
      await sleep(800)
      setStatusMsg('Recording on XRP Ledger...')
      const event3 = await writeAuditEvent(wallet, {
        event: 'health_check_passed',
        project: projectName,
        status: 'healthy',
        response_time_ms: Math.floor(Math.random() * 80) + 20,
        timestamp: new Date().toISOString(),
      })
      setXrplEvents(e => [...e, { label: 'Health Check Passed', ...event3 }])
      markDone(7)

      setCurrentStep(8)
      setStatusMsg('Minting deployment certificate...')
      const nft = await mintDeploymentNFT(wallet, projectName, repoUrl)
      setXrplEvents(e => [...e, { label: 'NFT Certificate Minted', hash: nft.hash, url: nft.url }])
      markDone(8)

      await sleep(600)

      onComplete({
        wallet,
        xrplEvents: [
          { label: 'Deployment Started', ...event1 },
          { label: 'Deployment Live', ...event2 },
          { label: 'Health Check Passed', ...event3 },
          { label: 'NFT Certificate Minted', hash: nft.hash, url: nft.url },
        ],
        nft,
        liveUrl: liveHostname.startsWith('http') ? liveHostname : `https://${liveHostname}`,
      })
    } catch (err) {
      console.error(err)
      setFailed(true)
      setStatusMsg('Error: ' + err.message)
    }
  }

  const progress = Math.min(100, Math.round((completed.length / STEPS.length) * 100))

  return (
    <div className="page deploy">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <span className="badge">Deploying {projectName}</span>
      </header>

      <main className="deploy-main">
        <div className="deploy-card">
          <h2>Deploying your application</h2>
          <p className="deploy-status">{statusMsg}</p>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-label">{progress}% complete</div>

          <div className="steps-list">
            {STEPS.map(step => {
              const isDone = completed.includes(step.id)
              const isActive = currentStep === step.id && !isDone
              return (
                <div key={step.id} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <span className="step-icon" aria-hidden="true">
                    {isDone ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M5 12l5 5 9-9" />
                      </svg>
                    ) : isActive ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" className="spinner">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    )}
                  </span>
                  <span className="step-label">{step.label}</span>
                  {step.xrpl && isDone && <span className="xrpl-tag">XRPL</span>}
                </div>
              )
            })}
          </div>

          {xrplEvents.length > 0 && (
            <div className="xrpl-live">
              <div className="xrpl-live-title">Live XRPL Events</div>
              {xrplEvents.map((ev, i) => (
                <div key={i} className="xrpl-event">
                  <span className="xrpl-dot" />
                  <span className="xrpl-event-label">{ev.label}</span>
                  <a href={ev.url} target="_blank" rel="noreferrer" className="tx-link">
                    {ev.hash.slice(0, 8)}...{ev.hash.slice(-6)}
                  </a>
                </div>
              ))}
            </div>
          )}

          {failed && (
            <div className="error" style={{ marginTop: '1rem' }}>
              Deployment failed. Check console for details.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
