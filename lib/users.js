const fs = require('fs')
const util = require('util')
const stringify = require('json-stable-stringify')

const writeFile = util.promisify(fs.writeFile)

const USERS_FILE = './persistent/users.json'

let users
try {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
} catch (e) {
  users = {}
  console.error(`The admin has to write the first message to the bot. If someone else is faster, he will be the admin. (Admin is the first one in the '${USERS_FILE}'.)`)
}

async function saveUsersFile() {
  await writeFile(USERS_FILE, stringify(users,{ space: 2 }))
}

function getUsers() {
  return Object.keys(users).map(id => Number(id))
}

function getAdmin() {
  // assume first user in file is admin
  return getUsers()[0]
}

function addUser(userID) {
  users[userID] = {}
  return saveUsersFile()
}

function getUserSettings(userID) {
  return users[userID] || {}
}

function setUserSettings(userID, settings) {
  users[userID] = settings
  return saveUsersFile()
}

function middleware() {
  return async (ctx, next) => {
    const user = ctx.from && ctx.from.id
    if (!user) { return next() }

    ctx.session = getUserSettings(user)
    const before = JSON.stringify(ctx.session)
    await next()
    const after = JSON.stringify(ctx.session)
    // console.log('middleware', user)
    // console.log('before', before)
    // console.log('after ', after)

    if (before !== after) {
      await setUserSettings(user, ctx.session)
    }
  }
}

module.exports = {
  getUsers: getUsers,
  getAdmin: getAdmin,
  addUser: addUser,
  getUserSettings: getUserSettings,
  setUserSettings: setUserSettings,
  middleware: middleware
}
