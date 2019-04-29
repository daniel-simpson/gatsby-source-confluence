module.exports = {
  siteMetadata: {
    title: `Gatsby Source Confluence`,
    description: `Retrieves content from Confluence for use in Gatsby static sites.`,
    author: `daniel-simpson`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-source-confluence",
      options: {
        hostname: "templates.atlassian.net",
        auth: process.env.CONFLUENCE_AUTH || "", //Note: this is one of very few sites you could scrape without a valid auth token
        cql: "id = 33189",
        limit: 10,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
