// Only GraphQL queries here

import { gql, GraphQLClient } from 'graphql-request'
import { flatten } from './ops'

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
  const userShowsArray = await flatten(data, userNum)
  return userShowsArray
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

// TODO: display stat comparison with top 3 genres
const getUserAnimeStats = async (user) => {
  const variables = {
    userName: user
  }
  const showsQuery = gql`
    query getMinutesWatched($userName: String!)
        {
        User(name:$userName) {
          statistics {
            anime {
              minutesWatched
              count
              genres (sort:COUNT_DESC) {
                genre
                minutesWatched
              }
            }
          }
        }
      }
    }`

  const data = await client.request(showsQuery, variables)
  console.log(`${user} anime stats: `, data)
}

export {
  getShowList,
  getScoreFormat,
  getShowTitle
}
