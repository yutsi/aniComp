import React from 'react'

const Person = ({ persons, remove }) => {
  return (
    <tr>
      <td className='personName'>{persons.name}</td>
      <td className='personNumber'>{persons.number}</td>
      <td className='deleteButton'><button onClick={remove}>Delete</button></td>
    </tr>
  )
}

export default Person
