import React from 'react'

const Error = ({ message }) => {
  if (message === null) {
    return <div className='error' style={{ visibility: 'hidden' }}>placeholder</div>
  }

  return (
    <div className='error'>{message}</div>
  )
}

export default Error
