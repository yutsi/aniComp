import React from 'react'

const UsernamesHeader = ({ user1, user2 }) => {
  const user1URL = `https://anilist.co/user/${user1}`
  const user2URL = `https://anilist.co/user/${user2}`
  if (user1 && user2) {
    return (
      <h2><a href={user1URL} target='_blank' rel='noreferrer' className='username-header'>{user1}</a> vs. <a href={user2URL} target='_blank' rel='noreferrer' className='username-header'>{user2}</a></h2>
    )
  }

  return (
    <h2>user1 vs. user2</h2>
  )
}

export default UsernamesHeader
