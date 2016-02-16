import { createStore, combineReducers, applyMiddleware } from 'redux'
import expect from 'expect'
import thunk from 'redux-thunk'
import { reduxTimeout, addTimeout, removeTimeout, WATCH_ALL } from '../src/index'

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

function asyncTrigger () {
  return dispatch => {
    dispatch({
      type: 'TRIGGERED'
    })
  }
}

describe('reduxTimeout', () => {
  describe('triggering an action', () => {
    it ('triggers an action', (done) => {
      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
      }, 1200)

      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            clearTimeout(id)
            done()
            break
          case 'TEST_TRIGGER':
            clearTimeout(id)
            throw new Error('Did not trigger action')
            break
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      store.dispatch(addTimeout(1000, 'TEST_TRIGGER', trigger()))
    })
    it ('only triggers action once', function(done) {
      this.timeout(3100)

      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
      }, 3000)

      let count = 0
      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            if (++count > 1) {
              clearTimeout(id)
              throw new Error('Dispatched action twice')
              done()
            }
            break
          case 'TEST_TRIGGER':
            clearTimeout(id)
            done()
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      store.dispatch(addTimeout(1000, 'TEST_TRIGGER', trigger()))
    })
    it ('triggers an async action', (done) => {
      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
      }, 1700)

      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            clearTimeout(id)
            done()
          case 'TEST_TRIGGER':
            clearTimeout(id)
            throw new Error('Did not trigger action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(thunk, reduxTimeout()))
      store.dispatch(addTimeout(1000, 'TEST_TRIGGER', asyncTrigger()))
    })
    it ('does not trigger an action', (done) => {
      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        store.dispatch(removeTimeout('TEST_TRIGGER'))
        done()
      }, 900)

      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            clearTimeout(id)
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      store.dispatch(addTimeout(1200, 'TEST_TRIGGER', trigger()))
    })
  })
  describe('WATCH_ALL', () => {
    it ('WATCH_ALL triggers an action', (done) => {
      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
      }, 1100)

      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            clearTimeout(id)
            done()
          case 'TEST_TRIGGER':
            clearTimeout(id)
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      store.dispatch(addTimeout(1000, WATCH_ALL, trigger()))
    })
    it ('WATCH_ALL does not trigger an action if threshold not met', (done) => {
      var id = setTimeout(() => {
        store.dispatch({ type: 'TEST_TRIGGER' })
        clearTimeout(id)
        done()
      }, 900)

      function reducer (state = {}, action ) {
        switch(action.type) {
          case 'TRIGGERED':
            clearTimeout(id)          
            throw new Error('Triggered action')
          default:
            return
        }
      }
      const store = createStore(reducer, applyMiddleware(reduxTimeout()))
      store.dispatch(addTimeout(1000, WATCH_ALL, trigger()))
    })
  })
})