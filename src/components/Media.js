import React from 'react'
// add link to show
const Media = ({ media, user1, user2, mediaType }) => {
  const mediaTypeLower = mediaType.toLowerCase()
  const URL = `https://anilist.co/${mediaTypeLower}/${media.mediaId}`
  if (media) {
    return (
      <tr>
        <td className='mediaTitle'><a href={URL} target='_blank' rel='noreferrer'>{media.title}</a></td>
        <td className='mediaDifference'>{user1}: {media.score1} <br /> {user2}: {media.score2}</td>
      </tr>
    )
  }

  return null
}

export default Media
