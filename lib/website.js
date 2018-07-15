const fs = require('fs')
const request = require('request-promise-native')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const WEBSITES_FOLDER = './websites/'

if (!fs.existsSync(WEBSITES_FOLDER)) {
  fs.mkdirSync(WEBSITES_FOLDER)
}

async function getBody(uri) {
  const response = await request({
    resolveWithFullResponse: true,
    simple: false,
    uri: uri
  })

  if (response.statusCode !== 200) {
    throw new Error(`Receiving the website was unsuccessful: ${response.statusCode} ${response.statusMessage}`)
  }

  return response.body
}

function getFilenameOfName(name) {
  let filename = name
  filename = filename.replace(' ', '-')
  filename = filename.replace('.', '-')
  filename = filename.replace('/', '-')
  return `${WEBSITES_FOLDER}${filename}.html`
}

async function hasBodyChanged(name, currentWebsiteBody) {
  const filename = getFilenameOfName(name)

  try {
    const oldContent = await readFile(filename, 'utf8')
    if (oldContent !== currentWebsiteBody) {
      // has changed
      await writeFile(filename, currentWebsiteBody, 'utf8')

      return true
    } else {
      // nothing has changed
      return false
    }
  } catch (e) {
    // there isn't an old version yet… create
    await writeFile(filename, currentWebsiteBody, 'utf8')
    return undefined
  }
}

async function hasChanged(name, uri) {
  const body = await getBody(uri)
  return hasBodyChanged(name, body)
}


module.exports = {
  hasChanged: hasChanged
}
