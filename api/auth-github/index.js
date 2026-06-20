const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const PLATFORM_URL = process.env.PLATFORM_URL || 'https://platform.wcloud.sa'

module.exports = async function (context, req) {
  const code = req.query.code
  const error = req.query.error

  if (error) {
    context.res = { status: 302, headers: { Location: `${PLATFORM_URL}?auth=denied` } }
    return
  }

  if (!code) {
    context.res = { status: 302, headers: { Location: `${PLATFORM_URL}?auth=error` } }
    return
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code })
    })

    const tokenData = await tokenRes.json()
    context.log('Token exchange result:', tokenData.error || 'success', 'token_length:', tokenData.access_token?.length)

    if (tokenData.error || !tokenData.access_token) {
      context.res = { status: 302, headers: { Location: `${PLATFORM_URL}?auth=error&reason=${tokenData.error || 'no_token'}` } }
      return
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'wcloud.sa' }
    })
    const user = await userRes.json()
    context.log('User fetch status:', userRes.status, 'login:', user.login)

    // Store token in cookie — avoids URL encoding corruption
    const isLocal = PLATFORM_URL.includes('localhost')
    const cookieFlags = isLocal
      ? 'Path=/; SameSite=Lax; Max-Age=3600'
      : 'Path=/; SameSite=Lax; Secure; Max-Age=3600'

    const userParams = new URLSearchParams({
      auth: 'success',
      login: user.login || '',
      name: user.name || user.login || '',
      avatar: user.avatar_url || ''
    })

    context.res = {
      status: 302,
      headers: {
        Location: `${PLATFORM_URL}?${userParams.toString()}`,
        'Set-Cookie': `gh_token=${tokenData.access_token}; ${cookieFlags}`
      }
    }
  } catch (err) {
    context.log.error('GitHub OAuth error:', err.message)
    context.res = { status: 302, headers: { Location: `${PLATFORM_URL}?auth=error` } }
  }
}
