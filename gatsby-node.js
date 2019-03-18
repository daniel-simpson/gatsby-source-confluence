const fetch = require('node-fetch')
const queryString = require('query-string')

exports.sourceNodes = async (
  { actions, ...createNodeHelperFunctions },
  pluginOptions
) => {
  const { createNode } = actions

  // Get data from Confluence
  const results = await getSearchResults(pluginOptions)

  // Parse into nodes and add to GraphQL schema
  results.forEach(pageResult => {
    const node = formatPageNode(createNodeHelperFunctions, pageResult)
    //TODO: figure out how to set up page hierarchy
    createNode(node)
  })
}

const getSearchResults = async ({ hostname, auth, cql, limit = 10 }) => {
  return await fetch(
    `https://${hostname}/wiki/rest/api/content/search/?cql=(${cql})&expand=body.storage,history,ancestors&limit=${limit}`,
    {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
      },
    }
  )
    .then(x => x.json())
    .then(x => x.results.filter(result => result.type === 'page'))
    .catch(e => {
      console.error('Unable to retrieve data from Confluence:', e)
      process.exit(1)
    })
}

const formatPageNode = ({ createNodeId, createContentDigest }, result) => {
  content = {
    confluenceId: result.id,
    title: result.title,
    createdDate: new Date(result.history.createdDate),
    author: {
      name: result.history.createdBy.displayName,
      email: result.history.createdBy.email,
    },
    bodyHtml: result.body.storage.value,
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
