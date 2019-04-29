const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const generateWikiPages = resolve => {
    graphql(`
      {
        allConfluencePage {
          edges {
            node {
              id
              slug
            }
          }
        }
      }
    `).then(results => {
      const wikiTemplate = path.resolve(`./src/templates/wiki/index.js`)
      _.each(results.data.allConfluencePage.edges, nodeWrapper => {
        createPage({
          path: `/wiki/${nodeWrapper.node.slug}`,
          component: slash(wikiTemplate),
          context: {
            id: nodeWrapper.node.id,
          },
        })

        resolve()
      })
    })
  }

  return Promise.all([new Promise(generateWikiPages)])
}
