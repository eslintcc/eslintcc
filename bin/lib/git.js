const { resolve } = require('path')
const { existsSync } = require('fs')
const { exec } = require('./child_process')


function setUser(repoDir, name, email) {
  if (typeof email === 'undefined' && typeof name !== 'undefined') {
    email = name
    name = repoDir
    repoDir = '.'
  }
  exec(repoDir, `git config user.name ${name}`)
  exec(repoDir, `git config user.email ${email}`)
}


function cloneIfNotExists(cwd, dirname, repo) {
  const dir = resolve(cwd, dirname)

  if (!existsSync(dir)) {
    exec(cwd, `git clone ${repo} ${dirname}`)

    return true
  }

  return false
}


function withRemoute(branch, repo, fn) {
  const origin = `origin-${branch}-${new Date().getTime()}`

  exec(`git checkout ${branch}`)
  exec(`git remote add ${origin} ${repo}`)
  fn(origin)
  exec(`git remote remove ${origin}`)
}


exports.setUser = setUser
exports.cloneIfNotExists = cloneIfNotExists
exports.withRemoute = withRemoute
