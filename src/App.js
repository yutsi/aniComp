import React, { useState, useEffect } from 'react'
import Error from './components/Error'
import Media from './components/Media'
import { combineLists } from './services/ops'
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap'
import './custom.scss'

const App = () => {
  const [user1, setuser1] = useState('')
  const [user2, setuser2] = useState('')
  const [user1compared, setuser1compared] = useState('') // separate state from the input box for the comparison table's header
  const [user2compared, setuser2compared] = useState('')
  const [combined, setcombined] = useState([])
  const [loading, setloading] = useState(false)
  const [checked, setchecked] = useState(true) // "anime" checkbox is default
  const [mediaType, setmediaType] = useState('ANIME')
  const [message, setMessage] = useState(null)

  useEffect(() => { // clear message after 5 seconds
    console.log('clearing message')
    const timer = setTimeout(() => {
      setMessage(null)
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
      return false
    }
    if (nameInput.length > 100) {
      setMessage('Username must be under 100 characters.')
      return false
    }

    console.log('verified ', nameInput)
    return true
  }

  const compareUsers = async (event) => {
    event.preventDefault()
    setloading(true)
    if (!verifyUserName(user1) || !verifyUserName(user2)) { return }
    console.log(`Comparing ${user1} and ${user2}`)
    let data
    try {
      data = await combineLists(user1, user2, mediaType)
      if (data.includes('is not a valid username')) {
        setMessage(data)
        return
      }
    } catch (err) {
      setloading(false)
      setMessage(err)
      return
    }
    setuser1compared(user1)
    setuser2compared(user2)
    setcombined(data)
    setloading(false)
  }

  return (
    <Container>
      <Row>
        <Col lg={4}>
          <h1>Compare media lists of two AniList users</h1>
          <div className='description'>Scores are converted to a 10-point scale.</div>
          <Form onSubmit={compareUsers}>
            <Form.Group as={Row} controlId='enter-user1' className='pt-3'>
              <Form.Label column xs={2} md={3} className='text-nowrap'>
                user 1:
              </Form.Label>
              <Col xs={5}>
                <Form.Control onChange={handleUser1Change} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId='enter-user2' className='pt-3'>
              <Form.Label column xs={2} md={3} className='text-nowrap'>
                user 2:
              </Form.Label>
              <Col xs={5}>
                <Form.Control onChange={handleUser2Change} />
              </Col>
            </Form.Group>
            <Form.Group>
              <Form.Check type='radio' label='anime' checked={checked} onChange={handleCheckedChange} />
              <Form.Check type='radio' label='manga' checked={!checked} onChange={handleCheckedChange} />
            </Form.Group>
            <Button variant='primary' disabled={loading} type='submit' id='submit' aria-label='submit'>{loading ? 'Comparing' : 'Compare'}</Button>
          </Form>
          <Error message={message} />
        </Col>
        <Col md={6}>
          <h2>{user1compared || 'user1'} vs. {user2compared || 'user2'}</h2>
          <h3 className='agree'>Agree</h3>
          <Table aria-label='agree-media' bordered hover className='w-auto'>
            <tbody>
              {combined.filter((media) => media.scoreDifference <= 1)
                .map((media) => <Media key={media.mediaId} media={media} user1={user1compared} user2={user2compared} mediaType={mediaType} />)}
            </tbody>
          </Table>

          <h3 className='disagree'>Disagree</h3>
          <Table aria-label='disagree-media' bordered hover className='w-auto'>
            <tbody>
              {combined.filter((media) => media.scoreDifference > 1)
                .map((media) => <Media key={media.mediaId} media={media} user1={user1compared} user2={user2compared} mediaType={mediaType} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className='pb-2'>
        <Col className='justify-content-center pt-5'>This website was made by yutsi using <a href='https://react-bootstrap.github.io/' className='link-dark'>React-Bootstrap</a> and the <a href='https://bootswatch.com/cyborg/' className='link-dark'>Cyborg</a> theme with the <a href='https://anilist.gitbook.io/anilist-apiv2-docs/'>AniList API</a>. Check it out on <a href='https://github.com/yutsi/aniComp'>Github</a>.
        </Col>
      </Row>
    </Container>
  )
}

export default App
