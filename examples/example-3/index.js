/* eslint-disable react/jsx-no-bind */

import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom'
import {
  Provider,
  createStore,
  atom,
  selector,
  useSelector,
  useSetter,
} from '../../src/kinfolk.js'
import './styles.css'

// depth and width

const store = createStore()

const createSelectors = (depth, width) => {
  const initial = {}

  let prev = initial
  for (let i = 0; i < depth; i++) {
    prev[i] = {
      val: `depth:${i}`,
    }
    prev = prev[i]
  }

  const state = atom(initial, { label: 'state' })
  const selectors = []

  let prevSel = null
  for (let i = 0; i < depth; i++) {
    const sel = prevSel
    const selDepth = selector(() => {
      let c = 0

      console.log('EV')
      for (let x = 0; x < 1000000; x++) {
        c = Math.random()
      }

      if (sel) {
        return { ...sel()[i], val: c }
      }
      return { ...state()[0], val: c }
    })

    for (let j = 0; j < width; j++) {
      selectors.push(
        selector(() => {
          return selDepth().val + `:width{${j}}`
        }),
      )
    }

    prevSel = selDepth
  }

  return {
    selectors,
    state,
  }
}

const depth = 3
const width = 5000
const { state, selectors } = createSelectors(depth, width)

window.store = store
window.state = state
window.selectors = selectors

const lastSelector = selectors[selectors.length - 1]
const firstSelector = selectors[0]

console.log(lastSelector)
console.log(firstSelector)

let ct = 0
let start = null

function App() {
  const last = useSelector(lastSelector, [])
  const first = useSelector(firstSelector, [])
  const setState = useSetter(state)
  const [t, setT] = useState()

  useEffect(() => {
    if (start) {
      setT(`Re-render took ${performance.now() - start} ms`)
      start = null
    }
  })

  return (
    <div>
      <div>First: {first}</div>
      <div>Last: {last}</div>
      <div>{t}</div>
      <button
        onClick={() => {
          start = performance.now()
          setState((v) => ({
            ...v,
            [0]: { ...v[0], val: `test:${ct++}` },
          }))
        }}
      >
        Increment
      </button>
    </div>
  )
}

createRoot(document.querySelector('#root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
