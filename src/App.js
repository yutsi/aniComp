import React, { useState, useEffect } from 'react'
import Notification from './components/Notification'
import { getShowTitle, getShowList, combineLists } from './services/query'

const App = () => {
  const [user1, setuser1] = useState('yutsi')
  const [user2, setuser2] = useState('vinny')
  const [user1Shows, setuser1Shows] = useState([])
  const [user2Shows, setuser2Shows] = useState([])
  const [combined, setcombined] = useState([])
  const [checked, setchecked] = useState(true)
  const [mediaType, setmediaType] = useState('ANIME')
  const [message, setMessage] = useState(null)
  const [errorBool, setErrorBool] = useState(false)

  useEffect(() => { // clear message after 5 seconds
    console.log('clearing message')
    const timer = setTimeout(() => {
      setMessage(null)
      setErrorBool(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [message])

  const handleUser1Change = (event) => {
    setuser1(event.target.value)
  }

  const handleUser2Change = (event) => {
    setuser2(event.target.value)
  }

  const handleCheckedChange = (event) => {
    setchecked(!checked)
    setmediaType(event.target.value)
  }

  const verifyUserName = (nameInput) => {
    if (!nameInput) {
      setMessage('Please enter two usernames.')
      setErrorBool(true)
      return false
    }
    if (nameInput.length > 100) {
      setMessage('Username must be under 100 characters.')
      setErrorBool(true)
      return false
    }

    console.log('verified ', nameInput)
    return true
  }

  const compareUsers = (event) => {
    event.preventDefault()
    console.log(`Comparing ${user1} and ${user2}`)
    combineLists(user1, user2).then(data => {
      setcombined(data)
      console.log('combined ', combined)
    })
      .catch((err) => {
        setMessage(err)
        setErrorBool(true)
      })
    // const sameShows = user1ShowsArray.filter(user1ShowsArray.filter(shows1 => user2ShowsArray.some(shows2 => user1ShowsArray.mediaID === user2ShowsArray.mediaID)))

    // console.log(sameShows)

    // getShowTitle(idofShow)
  }

  return (
    <div className='main'>
      <div className='content-wrap'>
        <div className='entry-area'>
          <h1>Compare media lists of two AniList users</h1>
          <form className='add-table' onSubmit={compareUsers}>
            <div className='row'>
              <label htmlFor='enter user1' className='new-entry-label'>
                user 1:
              </label>
              <input name='enter user1' className='new-entry' onChange={handleUser1Change} />
            </div>
            <div className='row'>
              <label htmlFor='enter user2' className='new-entry-label'>
                user 2:
              </label>
              <input name='enter user2' className='new-entry' onChange={handleUser2Change} />
            </div>
            <div className='row'>
              <input className='radio' type='radio' id='anime' name='mediaType' value='ANIME' checked={checked} onChange={handleCheckedChange} />
              <label htmlFor='anime'>anime</label>
              <input className='radio' type='radio' id='manga' name='mediaType' value='MANGA' onChange={handleCheckedChange} />
              <label htmlFor='manga'>manga</label>
              <button type='submit'>Compare</button>
            </div>
          </form>
          <Notification message={message} isError={errorBool} />
        </div>

        <div className='compare-area'>
          <h2>{user1} vs. {user2}</h2>
          <table>
            <thead>
              <tr>
                <th>Agree</th>
                <th>Disagree</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>test</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <footer>
        <div className='footer'>
          {// TODO: Github link here
}
          This website was made by yutsi using React. Check it out on <a href=''>Github</a>.
        </div>
      </footer>
    </div>
  )
}

export default App
