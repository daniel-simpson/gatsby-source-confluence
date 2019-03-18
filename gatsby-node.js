const fetch = require('node-fetch')

exports.sourceNodes = async (
  { actions, ...createNodeHelperFunctions },
  pluginOptions
) => {
  const { createNode } = actions

  // Get data from Confluence
  const response = await search(pluginOptions)

  const baseUrl = response._links.base
  const results = response.results.filter(result => result.type === 'page')

  // Parse into nodes and add to GraphQL schema
  results.forEach(pageResult => {
    const node = formatPageNode(createNodeHelperFunctions, pageResult, baseUrl)
    //TODO: figure out how to set up page hierarchy
    createNode(node)
  })
}

const search = async ({ hostname, auth, cql, limit = 10 }) => {
  return await fetch(
    `https://${hostname}/wiki/rest/api/content/search/?cql=(${cql})&expand=body.view,history,ancestors&limit=${limit}`,
    {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
      },
    }
  )
    .then(x => x.json())
    .catch(e => {
      console.error('Unable to retrieve data from Confluence:', e)
      process.exit(1)
    })
}

const formatPageNode = (
  { createNodeId, createContentDigest },
  result,
  baseUrl
) => {
  content = {
    confluenceId: result.id,
    title: result.title,
    slug: slugify(result.title),
    confluenceUrl: `${baseUrl}${result._links.webui}`,
    createdDate: new Date(result.history.createdDate),
    author: {
      name: result.history.createdBy.displayName,
      email: result.history.createdBy.email,
    },
    bodyHtml: result.body.view.value,
  }

  const nodeId = createNodeId(`confluence-page-${content.confluenceId}`)
  const nodeContent = JSON.stringify(content)

  const nodeData = Object.assign({}, content, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `ConfluencePage`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  })

  return nodeData
}

// From: https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
const slugify = string => {
  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;'
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------'
  const p = new RegExp(a.split('').join('|'), 'g')
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with ‘and’
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
