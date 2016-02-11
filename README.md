Timeout middleware for Redux.

**Still in Development**

Installation
---
```
npm install --save redux-timeout
```

What is it?
---
Gives ability to dispatch actions if certain actions have not been dispatched in x amount of time.

Why?
---
Because Redux gives us a predictable way to track if events / actions are taking place in the application, we can make some assumptions from this and use this to our advantage.  

Example 1. If no actions have been dispatched in the past > 30 minutes, it's pretty safe to assume that the user is not actively using the application.  We could then dispatch an action that triggers the user to be logged out and require a fresh login. 

Example 2. In a live editing document, if no actions have been dispatched from a form in the past 3 seconds we could dispatch an action that persists the form to the server, therefore eliminating any need for some other debounce logic.

##Usage
Checkout the tests for further examples.

Initialize the middleware with no actions being watched
```
import { reduxTimeout } from 'redux-timeout'
const store = createStore(reducer, applyMiddleware(reduxTimeout()))
```

Initialize the middleware with 1 action (ACTION_TO_WATCH) being watched, a 5000 ms threshold, and dispatching the action returned from the trigger function if that threshold is met
```
import { reduxTimeout } from 'redux-timeout'
import { ACTION_TO_WATCH } from '/path/to/my/action/constants'
import { trigger } from '/path/to/my/action/creators'

const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, ACTION_TO_WATCH, trigger())))
```

Initialize the middleware with multiple actions being watched
```
import { reduxTimeout } from 'redux-timeout'
import { ACTION_TO_WATCH, ACTION_TO_WATCH_TWO } from '/path/to/my/action/constants'
import { trigger } from '/path/to/my/action/creators'

const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, [ ACTION_TO_WATCH, ACTION_TO_WATCH_TWO ], trigger())))
```

Initialize the middleware watching for any and all actions
```
import { reduxTimeout, WATCH_ALL } from 'redux-timeout'

const store = createStore(reducer, applyMiddleware(reduxTimeout(5000, WATCH_ALL, trigger())))
```

Dynamically add action to be watched (using direct action rather than action creator)
```
import { ADD_WATCHED } from 'redux-timeout'
import { ACTION_TO_WATCH, TRIGGER } from '/path/to/my/action/constants'

dispatch({
  type: ADD_WATCHED,
  payload: {
    threshold: 1000,
    action: ACTION_TO_WATCH,
    toDispatch: { type: TRIGGER }
  }
  threshold: 1000,
  action: ACTION_TO_WATCH,
  toDispatch: { type: TRIGGER }
})
```

Dynamically remove action to be watched
```
import { REMOVE_WATCHED } from 'redux-timeout'
import { ACTION_TO_WATCH } from '/path/to/my/action/constants'

dispatch({
  type: REMOVE_WATCHED,
  action: ACTION_TO_WATCH 
})
```


###API
redux-timeout constants
```
WATCH_ALL: set as an action to watch and the middleware will watch for ANY actions that are dispatched 
```
```
ADD_WATCHED: dispatch this action to add actions to be watched
```
```
REMOVE_WATCHED: removing an action from being watched
```
```
reduxTimeout([threshold], [ACTION_TO_WATCH], [ACTION_TO_DISPATCH])
```
**threshold**: time in ms.  If the duration since the last ACTION_TO_WATCH dispatch (or initialization of it being watched) is > then this threshold, then ACTION_TO_DISPATCH will be dispatched

**ACTION_TO_WATCH**: String -- action to watch for.

**ACTION_TO_DISPATCH**: Object / Function -- action to dispatch if threshold is passed.  Can use with any redux side effects middleware, eg. redux-thunk, redux-promise etc.
