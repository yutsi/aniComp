import { gql, GraphQLClient } from 'graphql-request'
const _ = require("lodash")


// TODO: combineLists returns empty the first time button is clicked.
// TODO : make mediaType work with ANIME or MANGA, query fails using those as a string. Could just use if-else for showsQuery
// TODO: Convert 5-point scale rating to 10-point
const client = new GraphQLClient('https://graphql.anilist.co')

const getShowList = async (user, userNum) => {
  console.log(user)
  const variables = {
    userName: user
  }
  const showsQuery = gql`
    query getShowList($userName: String!)
    {
        MediaListCollection (userName:$userName, type:ANIME) {
            lists {
            entries {
              mediaId
              score
            }
            }
        }
    }`

  const data = await client.request(showsQuery, variables)
  const userShowsArray = await flatten(data, userNum)
  return userShowsArray
}

const flatten = async (data, userNum) => {
  // return Object.entries(data.MediaListCollection.lists[0].entries)
  const flattened = []
  const parentArray = Object.entries(data.MediaListCollection.lists[0].entries) // Not getting stuff from Dropped list
  parentArray.forEach(arr => {
    arr.filter(n => n.mediaId !== undefined).forEach(obj => { // filter out undefined entries
      const { mediaId, score } = obj
      flattened.push(obj)
    })
  })

  let flattenedResult = []

  if (userNum === 1) {
    flattenedResult = flattened.map(({ mediaId, score: score1 }) => ({ mediaId, score1 }))
  } else {
    flattenedResult = flattened.map(({ mediaId, score: score2 }) => ({ mediaId, score2 }))
  }

  return flattenedResult
}

const combineLists = async (user1, user2) => {
  const user1list = await getShowList(user1, 1)
  const user2list = await getShowList(user2, 2)

  console.log('user1list', user1list)
  console.log('user2list', user2list)

  const merged = _.merge(_.keyBy(user1list, 'mediaId'), _.keyBy(user2list, 'mediaId'))
  const combined = _.values(merged)
  for (let i = 0; i < combined.length; i++) {           // remove entries with scores from only one user
    if (!combined[i].score1 || !combined[i].score2) {
      combined.splice(i, 1)
      i--
    }
  }
  const combinedEnglish = await replaceShowTitles(combined)
  console.log('combined', combinedEnglish)
  return combinedEnglish
}

const getShowTitle = async (showid, mediaType) => {
  const variables = {
    id: showid
  }
  const showTitle =
    gql`
    query getShowTitle($id: Int!)
    {
        Media (id: $id, type: ANIME) {
        id
            title {
            english
            }
        }
    }`

  const data = await client.request(showTitle, variables)
  console.log(data.Media.title.english)
  return data.Media.title.english
}

const replaceShowTitles = async (combined) => {
  for (const i of combined) {
    let mediaTitle = await getShowTitle(i.mediaId)
    _.assign(i, ({ title: mediaTitle }))
    let scoreDifference = Math.abs(i.score1 - i.score2)
    _.assign(i, ({ scoreDifference: scoreDifference }))     // calculate difference between scores and store as a property for sorting later
  }

  combined.sort((a, b) => a.scoreDifference - b.scoreDifference)  // sort by ascending order of score difference
  return combined
}

export {
  combineLists,
  getShowTitle
}
