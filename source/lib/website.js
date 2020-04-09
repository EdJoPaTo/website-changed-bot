const {readFile, writeFile} = require('fs').promises

const got = require('got')
const beautify = require('js-beautify')

const WEBSITES_FOLDER = './websites/'

async function getBody(uri) {
  const response = await got(uri)

  if (response.statusCode !== 200) {
    throw new Error(`Receiving the website was unsuccessful: ${response.statusCode} ${response.statusMessage}`)
  }

  return response.body
}

function getFilenameOfName(name) {
  const filename = name.replace(/[ ./]+/g, '-')
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
  } catch (_) {
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
