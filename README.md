Timeout middleware for Redux.

Installation
---
```
npm install --save redux-timeout
```

What is it?
---
Gives ability to dispatch actions if certain actions have not been dispatched in x amount of time.

[redux-effects-timeout](https://github.com/redux-effects/redux-effects-timeout) is a similar library to work with timeouts in redux.  The main difference between the 2, is this library (redux-timeout) will watch for actions as they are dispatched and reset the setTimeout accordingly.  If you are just looking for a way to dispatch actions after a certain period of time, redux-effects-timeout should be perfectly fine for you.

Why?
---
Because Redux gives us a predictable way to track if events / actions are taking place in the application, we can make some assumptions from this and use this to our advantage.  

Example 1. If no actions have been dispatched in the past > 30 minutes, it's pretty safe to assume that the user is not actively using the application.  We could then dispatch an action that triggers the user to be logged out and require a fresh login.

Example 2. In a live editing document, if no actions have been dispatched from a form in the past 2 seconds we could dispatch an action that persists the form to the server, therefore eliminating any need for some other debounce logic.

Usage
---
Checkout the tests for further examples.

Initialize the middleware
```
import { reduxTimeout } from 'redux-timeout'
const store = createStore(reducer, applyMiddleware(reduxTimeout()))
```

Add action to be watched
```
import { addTimeout } from 'redux-timeout'
import { ACTION_TO_WATCH, TRIGGER } from '/path/to/my/action/constants'

dispatch(addTimeout(1000, ACTION_TO_WATCH, { type: TRIGGER })
```

Remove action being watched
```
import { removeTimeout } from 'redux-timeout'
import { ACTION_TO_WATCH } from '/path/to/my/action/constants'

dispatch(removeTimeout(ACTION_TO_WATCH))
```

API
---
```
addTimeout(timeout, ACTION_TO_WATCH, ACTION_TO_DISPATCH)
```
**Arguments**

+ **timeout** (Integer): time in ms.  Uses this value when initializing the setTimeout.  This setTimeout will be cleared and recreated on any dispatches of ACTION_TO_WATCH.

+ **ACTION_TO_WATCH** (String): action to watch for. See purpose above.

+ **ACTION_TO_DISPATCH** (Object / Function): action to dispatch when the setTimeout is triggered.  Can use with any redux side effects middleware, eg. redux-thunk, redux-promise etc.

```
removeTimeout(ACTION_TO_REMOVE)
```
**Arguments**

+ **ACTION_TO_REMOVE** (String): action to remove from the watched list

**Constants**

```WATCH_ALL```: set as an action to watch and the middleware will watch for ANY actions that are dispatched.  Useful if implementing session timeout functionality (examples above or in test lib)
