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
      <p>
        For a list of file changes necessary to add gatsby-cource-confluence
        nodes to your site schema and generate wiki pages from this data, check
        out{" "}
        <a
          href="https://github.com/daniel-simpson/gatsby-source-confluence/compare/8a30f937^...8a30f937?expand=1"
          target="_blank"
          rel="noopener noreferrer"
        >
          this github diff
        </a>
        .
      </p>
      <p>
        gatsby-source-confluence uses cql syntax to query nodes.{" "}
        <a
          href="https://confluence.atlassian.com/confcloud/confluence-search-syntax-724765423.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          More info on CQL syntax can be found here
        </a>
      </p>
      <p>Here is a list of imported Confluence pages:</p>
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
