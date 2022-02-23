// Operations that transform the results of GraphQL queries

import { getScoreFormat, getShowList, getShowTitle } from './query'
const _ = require('lodash')

// flatten MediaList object for combination later
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

  console.log(`${user1}'s ${mediaType} list: `, user1list)
  console.log(`${user2}'s ${mediaType} list: `, user2list)

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

export {
  flatten,
  convertScores,
  combineLists
}
