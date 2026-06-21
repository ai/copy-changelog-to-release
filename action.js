import { readFileSync } from 'node:fs'

function extractChangelog(content, tagName) {
  let inSection = false
  const collected = []
  for (const line of content.split('\n')) {
    const header = line.match(/^#+ +(.*)/)
    if (header) {
      if (header[1] === tagName) {
        inSection = true
      } else if (inSection) {
        break
      }
    } else if (inSection) {
      collected.push(line)
    }
  }
  return collected
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n')
}

async function apiRequest({ method, path, token, apiUrl, body }) {
  let init = {
    method,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'copy-changelog-to-release',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers['Content-Type'] = 'application/json'
  }
  let response = await fetch(new URL(path, apiUrl), init)
  let text = await response.text()
  let parsed = text ? JSON.parse(text) : null
  return { status: response.status, body: parsed }
}

async function getReleaseByTag(opts) {
  let { owner, repo, tag } = opts
  let { status, body } = await apiRequest({
    ...opts,
    method: 'GET',
    path: `/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`
  })
  if (status === 404) return null
  if (status >= 200 && status < 300) return body
  throw new Error(`GitHub API ${status}: ${JSON.stringify(body)}`)
}

async function createRelease(opts) {
  let { owner, repo, tag, name, releaseBody, latest } = opts
  let { status, body } = await apiRequest({
    ...opts,
    method: 'POST',
    path: `/repos/${owner}/${repo}/releases`,
    body: {
      tag_name: tag,
      name,
      body: releaseBody,
      draft: false,
      prerelease: false,
      make_latest: latest ? 'true' : 'false'
    }
  })
  if (status >= 200 && status < 300) return body
  throw new Error(`GitHub API ${status}: ${JSON.stringify(body)}`)
}

async function updateRelease(opts) {
  let { owner, repo, id, name, releaseBody, latest } = opts
  let { status, body } = await apiRequest({
    ...opts,
    method: 'PATCH',
    path: `/repos/${owner}/${repo}/releases/${id}`,
    body: {
      name,
      body: releaseBody,
      draft: false,
      prerelease: false,
      make_latest: latest ? 'true' : 'false'
    }
  })
  if (status >= 200 && status < 300) return body
  throw new Error(`GitHub API ${status}: ${JSON.stringify(body)}`)
}

async function main() {
  let ref = process.env.GITHUB_REF || ''
  if (!ref.startsWith('refs/tags/')) {
    throw new Error(`Expected a tag ref, got: ${ref}`)
  }
  let tag = ref.slice('refs/tags/'.length)

  let releaseBody = extractChangelog(readFileSync('CHANGELOG.md', 'utf8'), tag)
  if (!releaseBody) {
    console.log(`No changelog entry found for ${tag}, skipping release.`)
    return
  }

  let token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN env var is required')

  let [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
  if (!owner || !repo) throw new Error('GITHUB_REPOSITORY env var is required')

  let apiUrl = process.env.GITHUB_API_URL || 'https://api.github.com'
  let latest = (process.env.INPUT_LATEST || 'true').toLowerCase() !== 'false'
  let ctx = { owner, repo, tag, token, apiUrl, name: tag, releaseBody, latest }

  let existing = await getReleaseByTag(ctx)
  let release = existing
    ? await updateRelease({ ...ctx, id: existing.id })
    : await createRelease(ctx)

  console.log(
    `Release ${existing ? 'updated' : 'created'}: ${release.html_url}`
  )
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
