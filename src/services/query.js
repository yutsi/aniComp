import { gql, GraphQLClient } from 'graphql-request'
const _ = require('lodash')

// TODO : make mediaType work with ANIME or MANGA, query fails using those as a string. Could just use if-else for showsQuery
const client = new GraphQLClient('https://graphql.anilist.co')

const getScoreFormat = async (user) => {
  const variables = {
    userName: user
  }
  const showsQuery = gql`
    query getScoreFormat($userName: String!)
    {
      User (name:$userName){
       mediaListOptions {
         scoreFormat
       }
     }
   }`

  const data = await client.request(showsQuery, variables)
  const scoreFormat = data.User.mediaListOptions.scoreFormat
  console.log(`Score format for ${user} is ${scoreFormat}`)
  if (scoreFormat == 'POINT_10' || scoreFormat == 'POINT_10_DECIMAL') {
    return 1
  }
  if (scoreFormat == 'POINT_100') {
    return 0.1
  }
  if (scoreFormat == 'POINT_5') {
    return 2
  }
  if (scoreFormat == 'POINT_3') {
    return 3.33
  }
}
const convertScores = async (user1, user2, combined) => { // Convert scores to 10-point scale and round to nearest tenth
  const multiplyFactor1 = await getScoreFormat(user1)
  const multiplyFactor2 = await getScoreFormat(user2)
  if (multiplyFactor1 === 1 && multiplyFactor2 === 1) {
    return combined
  }
  for (const i of combined) {
    const newScore1 = Math.round(i.score1 * multiplyFactor1 * 10) / 10
    _.assign(i, ({ score1: newScore1 }))
    const newScore2 = Math.round(i.score2 * multiplyFactor2 * 10) / 10
    _.assign(i, ({ score2: newScore2 }))
  }
  return combined
}

const getShowList = async (user, userNum, mediaType) => {
  const variables = {
    userName: user,
    type: mediaType
  }
  const showsQuery = gql`
    query getShowList($userName: String!, $type: MediaType)
    {
        MediaListCollection (userName:$userName, type:$type) {
            lists {
            entries {
              mediaId
              score
            }
            }
        }
    }`

  const data = await client.request(showsQuery, variables)
  console.log('data, ', data)
  const userShowsArray = await flatten(data, userNum)
  return userShowsArray
}

const flatten = async (data, userNum) => {
  const flattened = []
  const completedList = Object.entries(data.MediaListCollection.lists[0].entries) // from Completed list
  completedList.forEach(arr => {
    arr.filter(n => n.mediaId !== undefined).forEach(obj => { // filter out undefined entries
      const { mediaId, score } = obj
      flattened.push(obj)
    })
  })

  const droppedList = Object.entries(data.MediaListCollection.lists[1].entries) // from Dropped list
  droppedList.forEach(arr => {
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

const combineLists = async (user1, user2, mediaType) => {
  let user1list
  let user2list
  try {
    user1list = await getShowList(user1, 1, mediaType)
  } catch (err) {
    console.log(err)
    return `${user1} is not a valid username.`
  }
  try {
    user2list = await getShowList(user2, 2, mediaType)
  } catch (err) {
    console.log(err)
    return `${user2} is not a valid username.`
  }

  console.log('user1list', user1list)
  console.log('user2list', user2list)

  const merged = _.merge(_.keyBy(user1list, 'mediaId'), _.keyBy(user2list, 'mediaId'))
  const combined = _.values(merged)
  for (let i = 0; i < combined.length; i++) { // remove entries with scores from only one user
    if (!combined[i].score1 || !combined[i].score2) {
      combined.splice(i, 1)
      i--
    }
  }
  const combinedConvertedScores = await convertScores(user1, user2, combined)
  const combinedEnglish = await replaceShowTitles(combinedConvertedScores)
  console.log('combined', combinedEnglish)
  return combinedEnglish
}

const getShowTitle = async (showid, mediaType) => {
  const variables = {
    id: showid,
    type: mediaType
  }
  const showTitle =
    gql`
    query getShowTitle($id: Int!, $type: MediaType)
    {
        Media (id: $id, type:$type) {
        id
            title {
            english
            romaji
            native
            }
        }
    }`

  const data = await client.request(showTitle, variables)
  return data.Media.title.english || data.Media.title.romaji || data.Media.title.native // prioritizes English title
}

const replaceShowTitles = async (combined) => {
  for (const i of combined) {
    const mediaTitle = await getShowTitle(i.mediaId)
    _.assign(i, ({ title: mediaTitle }))
    const scoreDifference = Math.abs(i.score1 - i.score2)
    _.assign(i, ({ scoreDifference: scoreDifference })) // calculate difference between scores and store as a property for sorting later
  }

  combined.sort((a, b) => a.scoreDifference - b.scoreDifference) // sort by ascending order of score difference
  return combined
}

export {
  combineLists,
  getShowTitle
}
