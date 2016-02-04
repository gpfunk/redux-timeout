'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var ADD_WATCHED = '@@reduxTimeout/ADD_WATCHED';
var REMOVE_WATCHED = '@@reduxTimeout/REMOVE_WATCHED';
var WATCH_ALL = '@@reduxTimeout/WATCH_ALL';

var watch = {};

var add = function add(threshold, action, toDispatch) {
  if (typeof threshold !== 'number') {
    return new Error('Expected threshold to be a number');
  }
  if (typeof action !== 'string' && !(action instanceof Array)) {
    return new Error('Expected action to be a string or an array');
  }
  if ((typeof toDispatch === 'undefined' ? 'undefined' : _typeof(toDispatch)) !== 'object' && typeof toDispatch !== 'function') {
    return new Error('Expected toDispatch to be an object or a function that would return an object');
  }

  // ensures all objects are watching the same object
  var monitor = {
    threshold: threshold,
    toDispatch: toDispatch,
    lastAction: Date.now()
  };

  var addAction = function addAction(a) {
    if (typeof a !== 'string') {
      return new Error('Expected action to be a string');
    }
    watch[a] = monitor;
  };

  if (action instanceof Array) {
    action.forEach(function (a) {
      addAction(a);
    });
  } else {
    addAction(action);
  }
};

var remove = function remove(action) {
  delete watch[action];
};

/**
 * dispatches an action if an action has not been dispatched within the specified threshold
 * @param  {Number} threshold The time in ms to allow before dispatching an action
 * @param {String | [String]} action The action, or array of actions, to monitor
 * @param {Function} toDispatch An action creator, lib agnostic (redux-thunk, redux-promise etc.)
 */
var reduxTimeout = function reduxTimeout(threshold, action, toDispatch) {
  // if any argument is passed through assume they're attempting to initialize the middleware
  if (threshold) {
    add(threshold, action, toDispatch);
  }

  return function (store) {
    return function (next) {
      return function (action) {
        var now = Date.now();

        var trigger = function trigger(action) {
          // check if object is being monitored at the moment
          var monitor = watch[action];
          if (monitor) {
            // if the threshold has been reached, dispatch the action
            if (now - monitor.lastAction > monitor.threshold && !monitor.dispatching) {
              monitor.dispatching = true;
              store.dispatch(monitor.toDispatch());
            }
            monitor.lastAction = now;
            monitor.dispatching = false;
          }
        };

        trigger(action.type);
        trigger(WATCH_ALL);

        if (action.type === REMOVE_WATCHED) {
          remove(action.action);
        }
        if (action.type === ADD_WATCHED) {
          add(action.threshold, action.action, action.toDispatch);
        }
        return next(action);
      };
    };
  };
};

module.exports = {
  reduxTimeout: reduxTimeout,
  _watch: watch,
  ADD_WATCHED: ADD_WATCHED,
  REMOVE_WATCHED: REMOVE_WATCHED,
  WATCH_ALL: WATCH_ALL
};
