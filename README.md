# Gatsby-Source-Confluence

A quick and dirty Gatsby source plugin for retrieving data from everybody's least favourite content editor, Confluence.

## Installation

`npm i --save gatsby-source-confluence`

## Usage

Add the following to your gatsby-config.js file:

```js
module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-confluence',
      options: {
        hostname: 'companyname.atlassian.net',
        auth: 'Basic XXX...',
        cql: 'ancestor = 534095277',
        limit: 10,
      },
    },
  ],
}
```

Please ensure that the following parameters are set:

- hostname (Required): the Confluence base URL to use for all requests
- auth: Your username.password base64 encoded with a `Basic` prefix. Please don't check this in to source control ;)
- cql (Required): a CQL expression to filter out a list of documents
- limit: Defaults to `10`. Please set this to the maximum number of documents to load in.

## Known issues

- No pagination built in, have to set a `limit` value above the number of documents to pull in.
- Confluence storage often has macros embedded. Macros not handled.
- Only handles pages, not blog posts
- No page tree hierarchy (I told you this was rough!)

Pull requests welcome!
