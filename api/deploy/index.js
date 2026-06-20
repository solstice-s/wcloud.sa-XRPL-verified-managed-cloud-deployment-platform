const AZURE_SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID
const AZURE_RESOURCE_GROUP = process.env.AZURE_RESOURCE_GROUP || 'rg-platform-wcloud'
const AZURE_LOCATION = process.env.AZURE_LOCATION || 'eastasia'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

async function getAzureToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AZURE_CLIENT_ID,
        client_secret: process.env.AZURE_CLIENT_SECRET,
        scope: 'https://management.azure.com/.default'
      })
    }
  )
  const data = await res.json()
  return data.access_token
}

async function detectBuildConfig(repoUrl, githubToken) {
  const [, , , owner, repo] = repoUrl.replace('.git', '').split('/')
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    'User-Agent': 'wcloud.sa',
    Accept: 'application/vnd.github+json'
  }

  // Detect package manager from lock file
  let installCmd = 'npm install'
  let buildPrefix = 'npm run'
  try {
    const pnpmLock = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/pnpm-lock.yaml`, { headers })
    if (pnpmLock.ok) {
      installCmd = 'npm install -g pnpm && pnpm install'
      buildPrefix = 'pnpm run'
    } else {
      const yarnLock = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/yarn.lock`, { headers })
      if (yarnLock.ok) {
        installCmd = 'yarn install'
        buildPrefix = 'yarn'
      }
    }
  } catch (e) {}

  // Read package.json to detect framework + output dir
  try {
    const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers })
    if (pkgRes.ok) {
      const data = await pkgRes.json()
      const content = Buffer.from(data.content, 'base64').toString()
      const pkg = JSON.parse(content)
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      const build = pkg.scripts?.build || ''
      const buildCmd = `${installCmd} && ${buildPrefix} build`

      if (deps['next'] || build.includes('next')) return { appLocation: '/', outputLocation: 'out', appBuildCommand: buildCmd }
      if (deps['vite']) return { appLocation: '/', outputLocation: 'dist', appBuildCommand: buildCmd }
      if (deps['react-scripts']) return { appLocation: '/', outputLocation: 'build', appBuildCommand: buildCmd }
      if (deps['vue']) return { appLocation: '/', outputLocation: 'dist', appBuildCommand: buildCmd }
      return { appLocation: '/', outputLocation: 'dist', appBuildCommand: buildCmd }
    }
  } catch (e) {}

  // Default: plain static HTML
  return { appLocation: '/', outputLocation: '/', appBuildCommand: '' }
}

async function createSWAWithGitHub(projectName, repoUrl, branch, githubToken, azureToken, buildConfig, clientLogin, xrplWallet) {
  const appName = `wcloud-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  const url = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${appName}?api-version=2022-03-01`

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${azureToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: AZURE_LOCATION,
      sku: { name: 'Free', tier: 'Free' },
      tags: {
        clientLogin: clientLogin || 'anonymous',
        projectName: projectName,
        repoUrl: repoUrl,
        deployedAt: new Date().toISOString(),
        xrplWallet: xrplWallet || ''
      },
      properties: {
        repositoryUrl: repoUrl,
        branch: branch || 'main',
        repositoryToken: githubToken,
        buildProperties: buildConfig
      }
    })
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data.message || data.error?.message || `ARM ${res.status}`
    throw new Error(msg)
  }
  return { appName, defaultHostname: data.properties?.defaultHostname }
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS_HEADERS }
    return
  }

  const { projectName, repoUrl, branch, githubToken, clientLogin, xrplWallet } = req.body || {}

  if (!githubToken) {
    context.res = { status: 401, headers: CORS_HEADERS, body: { error: 'GitHub token required' } }
    return
  }

  if (!projectName || !repoUrl) {
    context.res = { status: 400, headers: CORS_HEADERS, body: { error: 'projectName and repoUrl required' } }
    return
  }

  try {
    context.log('Getting Azure token...')
    const azureToken = await getAzureToken()
    if (!azureToken) throw new Error('Failed to get Azure token')

    context.log('Detecting build config...')
    const buildConfig = await detectBuildConfig(repoUrl, githubToken)
    context.log('Build config:', JSON.stringify(buildConfig))

    context.log('Creating SWA with GitHub link...')
    const { appName, defaultHostname } = await createSWAWithGitHub(
      projectName, repoUrl, branch, githubToken, azureToken, buildConfig, clientLogin, xrplWallet
    )
    context.log('SWA created:', appName, 'hostname:', defaultHostname)

    context.res = {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: {
        status: 'building',
        appName,
        defaultHostname,
        customDomain: `${projectName.toLowerCase()}.platform.wcloud.sa`,
        buildConfig,
        message: 'Azure SWA created — GitHub Actions building app now (2-3 min)'
      }
    }
  } catch (err) {
    context.log.error('Deploy error:', err.message)
    let userMsg = err.message
    if (err.message.includes('RepositoryToken')) {
      userMsg = 'GitHub permission missing. Please disconnect and reconnect GitHub to grant workflow permissions.'
    }
    context.res = {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: { error: userMsg }
    }
  }
}
