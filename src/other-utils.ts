

export const UtilFunctions = {
  getQueryLogStr            : (query : String) => {
    return query.replace(/\s\s+/g, ' ').trim()
  }
}