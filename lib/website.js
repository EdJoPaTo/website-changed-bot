const {readFile, writeFile} = require('fs').promises

const request = require('request-promise-native')
const beautify = require('js-beautify')

const WEBSITES_FOLDER = './websites/'

async function getBody(uri) {
  const response = await request({
    resolveWithFullResponse: true,
    simple: false,
    uri
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
    if (oldContent === currentWebsiteBody) {
      // Nothing has changed
      return false
    }

    // Has changed
    await writeFile(filename, currentWebsiteBody, 'utf8')

    return true
  } catch (error) {
    // There isn't an old version yet… create
    await writeFile(filename, currentWebsiteBody, 'utf8')
    return undefined
  }
}

async function hasChanged(name, uri) {
  const body = await getBody(uri)
  const beautified = beautify.html(body)
  return hasBodyChanged(name, beautified)
}

module.exports = {
  hasChanged
}
