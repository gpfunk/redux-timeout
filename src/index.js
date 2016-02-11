const ADD_WATCHED = '@@reduxTimeout/ADD_WATCHED'
const REMOVE_WATCHED = '@@reduxTimeout/REMOVE_WATCHED'
const WATCH_ALL = '@@reduxTimeout/WATCH_ALL'

let watch = {}

const add = (threshold, action, toDispatch) => {
  if (typeof threshold !== 'number') {
    return new Error('Expected threshold to be a number')
  }
  if (typeof action !== 'string' && !(action instanceof Array)) {
    return new Error('Expected action to be a string or an array')
  }
  if (typeof toDispatch !== 'object' && typeof toDispatch !== 'function') {
    return new Error('Expected toDispatch to be an object or a function that would return an object')
  }

  // ensures all objects are watching the same object
  const monitor = {
    threshold,
    toDispatch,
    lastAction: Date.now()
  }

  const addAction = (a) => {
    if (typeof a !== 'string') {
      return new Error('Expected action to be a string')
    }
    watch[a] = monitor
  }

  if (action instanceof Array) {
    action.forEach((a) => {
      addAction(a)
    }) 
  } else {
    addAction(action)
  }
}

const remove = (action) => {
  delete watch[action]
}

/**
 * dispatches an action if an action has not been dispatched within the specified threshold
 * @param  {Number} threshold The time in ms to allow before dispatching an action
 * @param {String | [String]} action The action, or array of actions, to monitor
 * @param {Function} toDispatch An action creator, lib agnostic (redux-thunk, redux-promise etc.)
 */
const reduxTimeout = (threshold, action, toDispatch) => {
  // if any argument is passed through assume they're attempting to initialize the middleware 
  if (threshold) {
    add(threshold, action, toDispatch)
  }

  return store => next => action => {
    let now = Date.now()

    const trigger = (action) => {
      // check if object is being monitored at the moment
      let monitor = watch[action]
      if (monitor) {
        // if the threshold has been reached, dispatch the action
        if (now - monitor.lastAction > monitor.threshold && !monitor.dispatching) {
          monitor.dispatching = true
          store.dispatch(monitor.toDispatch)
        }
        monitor.lastAction = now
        monitor.dispatching = false
      }
    } 

    trigger(action.type)
    trigger(WATCH_ALL)

    if (action.type === REMOVE_WATCHED && action.payload && action.payload.action) {
      remove(action.payload.action)
    }
    if (action.type === ADD_WATCHED && action.payload) {
      let { payload } = action
      add(payload.threshold, payload.action, payload.toDispatch)
    }
    return next(action)
  }
}

module.exports = {
  reduxTimeout,
  _watch: watch,
  ADD_WATCHED,
  REMOVE_WATCHED,
  WATCH_ALL
}
