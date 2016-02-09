import { createStore, combineReducers, applyMiddleware } from 'redux'
import expect from 'expect'
import { reduxTimeout, _watch, ADD_WATCHED, REMOVE_WATCHED, WATCH_ALL } from '../src/index'

function reducer (state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

function trigger () {
  return {
    type: 'TRIGGERED'
  }
}

describe('reduxTimeout', () => {
  describe('middleware initialization', () => {
    it ('initializes the middlware without a watched action', () => {
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      expect(_watch).toEqual({})
    })
    it ('initializes the middleware with a watched action', () => {
      const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, 'WATCH', trigger)))
      expect(_watch['WATCH']).toExist()
    })
    it ('initializes the middleware with the WATCH_ALL action', () => {
      const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, WATCH_ALL, trigger)))
      expect(_watch[WATCH_ALL]).toExist()
    })
    it ('initializes the middleware with an array', () => {
      const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, ['WATCH', 'WATCHTWO'], trigger)))
      expect(_watch['WATCH']).toExist()
      expect(_watch['WATCHTWO']).toExist()
      expect(_watch['WATCHTHREE']).toNotExist()
    })
  })
  describe('dynamic alteration of actions to watch', () => {
    var store = createStore(reducer, applyMiddleware(reduxTimeout()))
    it ('should not add an action to watch', () => {
      store.dispatch({
        type: ADD_WATCHED
      })
      expect(_watch['TEST']).toNotExist()
    })
    it ('should not add an action to watch', () => {
      store.dispatch({
        type: ADD_WATCHED,
        payload: {
          threshold: 1000
        }
      })
      expect(_watch['TEST']).toNotExist()
    })
    it ('should not add an action to watch', () => {
      store.dispatch({
        type: ADD_WATCHED,
        payload: {
          threshold: 1000,
          action: 'TEST'
        }
      })
      expect(_watch['TEST']).toNotExist()
    })
    it ('should add an action to watch', () => {
      store.dispatch({
        type: ADD_WATCHED,
        payload: {
          threshold: 1000,
          action: 'TEST',
          toDispatch: trigger
        }
      })
      expect(_watch['TEST']).toExist()
    })
    it ('should remove a watched action', () => {
      expect(_watch['TEST']).toExist()
      store.dispatch({
        type: REMOVE_WATCHED,
        payload: {
          action: 'TEST'
        }
      })
      expect(_watch['TEST']).toNotExist()
    })
  })
  describe('triggering an action', () => {
    it ('triggers an action', (done) => {
      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            done()
          case 'TEST_TRIGGER':
            throw new Error('Did not trigger action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout(1000, 'TEST_TRIGGER', trigger)))
      setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        done()
      }, 1100)
    })
    it ('does not trigger an action', (done) => {
      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout(1000, 'TEST_TRIGGER', trigger)))
      setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        done()
      }, 900)
    })
  })
  describe('WATCH_ALL', () => {
    it ('WATCH_ALL triggers an action if threshold met', (done) => {
      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            done()
          case 'TEST_TRIGGER':
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout(1000, WATCH_ALL, trigger)))
      setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        done()
      }, 1020)
    })
    it ('WATCH_ALL does not trigger an action if threshold not met', (done) => {
      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout(1000, WATCH_ALL, trigger)))
      setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        done()
      }, 900)
    })
  })
})