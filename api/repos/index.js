const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS_HEADERS }
    return
  }

  const authHeader = req.headers['authorization']
  context.log('Auth header present:', !!authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.res = { status: 401, headers: CORS_HEADERS, body: { error: 'Unauthorized' } }
    return
  }

  const token = authHeader.split(' ')[1]
  context.log('Token length:', token.length)

  try {
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'wcloud.sa',
        'Accept': 'application/vnd.github+json'
      }
    })

    context.log('GitHub API status:', res.status)

    if (!res.ok) {
      const ghError = await res.json().catch(() => ({}))
      context.log.error('GitHub error:', JSON.stringify(ghError))
      context.res = {
        status: 401,
        headers: CORS_HEADERS,
        body: { error: 'Invalid GitHub token', detail: ghError.message }
      }
      return
    }

    const repos = await res.json()

    const simplified = repos.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description,
      private: r.private,
      language: r.language,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at
    }))

    context.res = {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: simplified
    }
  } catch (err) {
    context.log.error('Repos fetch error:', err.message)
    context.res = { status: 500, headers: CORS_HEADERS, body: { error: err.message } }
  }
}
