import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../../components/layout"

const WikiPage = ({ data }) => {
  const { title, confluenceUrl, bodyHtml } = data.confluencePage
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <small>
          <Link to="/wiki">&lt; Back</Link>
        </small>
        <small>
          <a href={confluenceUrl} target="_blank" rel="noopener noreferrer">
            Edit this page
          </a>
        </small>
      </div>

      <h1>{title}</h1>

      <main>
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </main>

      <div style={{ maxWidth: "300px", marginBottom: "1.45rem" }} />
    </Layout>
  )
}

export default WikiPage

export const WikiPageQuery = graphql`
  query wikiQuery($id: String) {
    confluencePage(id: { eq: $id }) {
      title
      bodyHtml
      confluenceUrl
    }
  }
`
