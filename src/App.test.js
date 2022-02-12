import React from 'react';
import ReactDOM from 'react-dom';
import userEvent from '@testing-library/user-event'
import {getByRole, render, screen, waitFor} from '@testing-library/react'
import App from './App';

// it('renders without crashing', () => {
//   const div = document.createElement('div')
//   ReactDOM.render(<App />, div)
// })

test('clicking manga checks box', () => {
  render(<App />)
  const anime = screen.getByRole('radio', {name: 'anime'})
  const manga = screen.getByRole('radio', {name: 'manga'})
  expect(anime).toBeChecked()
  userEvent.click(manga)
  expect(anime).not.toBeChecked()
  expect(manga).toBeChecked()
})

test('enter valid users and get non-empty comparison list', async () => {
  render(<App />)
  const user1 = screen.getByRole('textbox', {name: 'enter user1'})
  const user2 = screen.getByRole('textbox', {name: 'enter user2'})
  const submit = screen.getByRole('button', {name: 'submit'})
  const agreeMedia = screen.getByRole('table', {name: 'agree-media'})

  userEvent.type(user1, 'yutsi')
  userEvent.type(user2, 'bokunodom')
  userEvent.click(submit)

  await waitFor(() => expect(agreeMedia).not.toBeEmptyDOMElement())
})