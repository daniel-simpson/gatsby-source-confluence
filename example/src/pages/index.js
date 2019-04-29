import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => {
  console.log(data)
  const confluencePages = data.allConfluencePage.edges.map(n => n.node)
  return (
    <Layout>
      <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Here is a list of important Confluence Pages:</p>
      <ul>
        {confluencePages.map(page => (
          <li>
            <Link to={`/wiki/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default IndexPage

export const IndexPageQuery = graphql`
  query indexQuery {
    allConfluencePage {
      edges {
        node {
          title
          slug
        }
      }
    }
  }
`
