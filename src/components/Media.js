import React from 'react'

const Media = ({ media, user1, user2 }) => {
  if (media) {
    return (
      <tr>
        <td className='mediaTitle'>{media.title}</td>
        <td className='mediaDifference'>{user1}: {media.score1} <br /> {user2}: {media.score2}</td>
      </tr>
    )
  }

  return null
}

export default Media
