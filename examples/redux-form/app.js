import React, { Component } from 'react'
import { render } from 'react-dom'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'
import { Provider, connect } from 'react-redux'
import { reducer as formReducer, getValues, actionTypes, reduxForm } from 'redux-form'
import { addTimeout, reduxTimeout, WATCH_ALL } from 'redux-timeout'

const reducers = {
  form: formReducer
}
const reducer = combineReducers(reducers)
const store = createStore(reducer, applyMiddleware(reduxTimeout(), logger()))

class App extends Component {
  componentDidMount() {
    this.props.addTimeout(2000, actionTypes.CHANGE, this.save.bind(this));
  }

  save() {
    this.props.save()
  }

  render() {
    const { fields: { firstName, lastName }} = this.props
    return (
      <form>
        <div>
          <label>First Name</label>
          <input type="text" {...firstName} />
        </div>
        <div>
          <label>Last Name</label>
          <input type="text" {...lastName} />
        </div>
      </form>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    values: getValues(state.form.test)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTimeout: (timeout, action, toDispatch) => {
      dispatch(addTimeout(timeout, action, toDispatch))
    },
    save: () => {
      dispatch({type: 'SAVE'})
    }
  }
}

const form = connect(mapStateToProps, mapDispatchToProps)(App);

App = reduxForm({
  form: 'test',
  fields: ['firstName', 'lastName']
})(form)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));
