const fetch = require('node-fetch')

exports.sourceNodes = async (
  { actions, ...createNodeHelperFunctions },
  pluginOptions
) => {
  const { createNode } = actions

  // Get data from Confluence
  const fetchURL = 'https://'+ pluginOptions.hostname +'/wiki/rest/api/content/search/?cql=('+ pluginOptions.cql +')&expand=body.view,metadata.labels,history,ancestors,children.attachment&limit='+ pluginOptions.limit
  const response = await fetchRequest(fetchURL, pluginOptions.auth)

  const baseUrl = 'https://'+ pluginOptions.hostname +'/wiki';
  const pages = response.filter(result => result.type === 'page')
  // Parse into nodes and add to GraphQL schema
  const nodes = pages.map(pageResult =>
    formatPageNode(createNodeHelperFunctions, pageResult, baseUrl)
  )

  nodes.forEach(node => {
    // Create node
    createNode(node)
  })
  

}

var dataOut = [];
//based on https://stackoverflow.com/questions/62337587/return-paginated-output-recursively-with-fetch-api
async function fetchRequest(url, auth) {
  try {
    // Fetch request and parse as JSON
    const response = await fetch(url,
    {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
      },
    });
    let data = await response.json();
    dataOut = dataOut.concat(data.results);

    // Extract the url of the response's "next"
    let next_page;
    if ( data.hasOwnProperty("_links") ) {
      if ( data._links.hasOwnProperty("next") ) {
        next_page = data._links.base + data._links.next;
      }
    }

    // If another page exists, merge its output into the array recursively
    console.log('Fetch next_page: ' + next_page)
    if (next_page) {
      dataOut.concat( await fetchRequest(next_page, auth) );
    }
    return dataOut;
  } catch (err) {
    return console.error(err);
  }
}

function updateLinksInHTML(html) {

  const regexLinks = /href\s*=\s*(['"])(https?:\/\/eugem.+?|\/wiki\/.+?)\1/gm;
  const regexId = /(?<=pages\/)([0-9]*)(?=\/)/i;
  let link;
  let newURL;
  while((link = regexLinks.exec(html)) !== null) {
    newURL = regexId.exec(link[2])
    if (newURL) {

      html = html.replace(link[2], '/wiki/' + newURL[0]);
    }
    
  }

  const regexLinks2 = /href\s*=\s*(['"])(https?:\/\/eugem.+?|\/wiki\/label\/EUGEM\/.+?)\1/gm;
  let link2;
  while((link2 = regexLinks2.exec(html)) !== null) {
    html = html.replace('/wiki/label/EUGEM/', '/wiki/labels?s=');
  }

  return html;

}

const formatPageNode = (
  { createNodeId, createContentDigest },
  result,
  baseUrl
) => {
  let htmlBody = updateLinksInHTML(result.body.view.value);
  let pLabels = []
  if (result.metadata.hasOwnProperty('labels')){
    pLabels = result.metadata.labels.results;
  }
  let regexImage = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
  let pImages = []
  if ( result.children.hasOwnProperty('attachment') ){
    let allAttach = result.children.attachment.results;
    for (let i=0; i<allAttach.length; i++){
      let attach = allAttach[i];
      if ( attach.hasOwnProperty('title') ){
        if( regexImage.test(attach.title) ){
          let imgURL = baseUrl + attach._links.download;
          pImages.push(imgURL);
        }
      }
    }
  }

  content = {
    confluenceId: result.id,
    title: result.title,
    slug: result.id, //was  slugify(result.title) but then this would break bookmarks if a title is changed
    confluenceUrl: `${baseUrl}${result._links.webui}`,
    createdDate: new Date(result.history.createdDate),
    author: {
      name: result.history.createdBy.displayName,
      email: result.history.createdBy.email,
    },
    bodyHtml: htmlBody,
    labels: pLabels,
    ancestors: result.ancestors,
    images: pImages
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


async function formatAttachmentNode (helper,result,baseUrl,auth) {
  let downloadUrl = baseUrl + result._links.download;
  const response = await fetchRequest(downloadUrl, auth)
  return response;
}

//no longer in use...
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

