const { promises: fs } = require('fs')
const readdir = require('recursive-readdir-filter')

const options = {
  filterFile: function (stats) {
    return stats.name === 'package.json'
  }
}

const users = new Map()

const addUser = (name) => {
  const count = users.get(name) || 0
  users.set(name, count + 1)
}

const dump = (user) => {
  if (user == null) {
    return
  }
  if (Array.isArray(user)) {
    return user.map(dump)
  }
  if (typeof user === 'string') {
    user = user.trim()
    if (user.length > 0) {
      return addUser(user)
    }
  }
  if (user.name != null) {
    return addUser(user.name)
  }
  if (user.email != null) {
    return addUser(user.email)
  }
  if (user.url != null) {
    return addUser(user.url)
  }
}

const formatUsers = () => {
  const sortedUsers = [...users.entries()].sort((a, b) => {
    return b[1] - a[1]
  })
  const top = sortedUsers.slice(0, 10)
  for (const [author, count] of top) {
    console.log(`[${count}] ${author}`)
  }
}

readdir('./node_modules', options, async (err, files) => {
  await Promise.all(files.map(async (file) => {
    const jsonString = await fs.readFile(file, 'utf8')
    const json = JSON.parse(jsonString)
    dump(json.author)
    dump(json.contributors)
  }))
  formatUsers()
});
