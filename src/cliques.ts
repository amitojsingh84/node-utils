import bronKerbosch from '@seregpie/bron-kerbosch'
import { Logger }   from './logger'


/**
 * **Note:** This method helps in finding all the maximal networks/cliques from the array
 * of network pairs  
 * @param we are providing all the network pairs 
 * the cliques that are formed using above pairs are returned from this function * 
 * @returns maximal network/cliques are returned
 * @example
 * 
 * const pairs = [[6, 4], [4, 3], [4, 5], [5, 2], [5, 1], [1, 2]] as input
 * constructMaximalCliques(pairs)
 * -> [[4, 6], [4, 3], [4, 5], [2, 5, 1]]
 * 
 */
function constructMaximalCliques(logger: Logger, pairs : Iterable<[number, number]>) : number[][] {
  logger.debug('In getCliques %s', JSON.stringify(pairs))

  const cliques = bronKerbosch(pairs)

  return cliques
}

module.exports = { constructMaximalCliques }