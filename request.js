exports.reset = (request, entry) => {
  request.params = Object.assign({}, ...(entry.parameters || []).map(p => ({
    [p.name]: p.schema.enum ? p.schema.enum[0] : (p.schema.type === 'array' ? [] : null)
  })))
  if (entry.requestBody) {
    request.contentType = Object.keys(entry.requestBody.content)[0]
    request.requestBody = entry.requestBody.content[request.contentType].example || ''
  }
}

exports.fetch = (request, entry, api) => {
  let params = Object.assign({}, ...(entry.parameters || []).filter(p => p.in === 'query' && (p.schema.type === 'array' ? request.params[p.name].length : request.params[p.name]))
    .map(p => ({
      // TODO : join character for array should depend of p.style
      [p.name]: p.schema.type === 'array' ? request.params[p.name].join(',') : request.params[p.name]
    }))
  )
  let headers = Object.assign({}, ...(entry.parameters || []).filter(p => p.in === 'header' && (p.schema.type === 'array' ? request.params[p.name].length : request.params[p.name]))
    .map(p => ({
      // TODO : join character for array should depend of p.style
      [p.name]: p.schema.type === 'array' ? request.params[p.name].join(',') : request.params[p.name]
    }))
  )
  const httpRequest = {
    method: entry.method,
    url: api.servers[0].url + entry.path.replace(/{(\w*)}/g, (m, key) => {
      return request.params[key]
    }),
    params,
    headers
  }
  if (entry.requestBody) {
    httpRequest.headers['Content-type'] = request.contentType
    httpRequest.body = request.requestBody
  }
  $http(httpRequest).then(response => response.body)
}