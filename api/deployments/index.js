const AZURE_SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID
const AZURE_RESOURCE_GROUP = process.env.AZURE_RESOURCE_GROUP || 'rg-platform-wcloud'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
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

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS_HEADERS }
    return
  }

  const clientLogin = req.query.clientLogin
  if (!clientLogin) {
    context.res = { status: 400, headers: CORS_HEADERS, body: { error: 'clientLogin required' } }
    return
  }

  try {
    const azureToken = await getAzureToken()
    if (!azureToken) throw new Error('Azure auth failed')

    const url = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites?api-version=2022-03-01`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${azureToken}` }
    })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error?.message || 'Failed to list deployments')

    const userDeployments = (data.value || [])
      .filter(swa => swa.tags?.clientLogin === clientLogin)
      .map(swa => ({
        appName: swa.name,
        projectName: swa.tags?.projectName || swa.name.replace('wcloud-', ''),
        repoUrl: swa.tags?.repoUrl || '',
        defaultHostname: swa.properties?.defaultHostname,
        customDomain: `${(swa.tags?.projectName || swa.name.replace('wcloud-', '')).toLowerCase()}.platform.wcloud.sa`,
        deployedAt: swa.tags?.deployedAt || swa.systemData?.createdAt,
        xrplWallet: swa.tags?.xrplWallet || '',
        status: 'live'
      }))
      .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))

    context.res = {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: userDeployments
    }
  } catch (err) {
    context.log.error('Deployments error:', err.message)
    context.res = {
      status: 500,
      headers: CORS_HEADERS,
      body: { error: err.message }
    }
  }
}
