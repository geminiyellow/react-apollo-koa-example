import React, { PureComponent, PropTypes } from 'react'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { Divider } from 'semantic-ui-react'
import TodoList from '../../components/TodoList'
import AddTodo from './AddTodo'

class RemoteTodoApp extends PureComponent {
  static propTypes = {
    todos: PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      completed: PropTypes.bool
    }).isRequired,
    toggleTodo: PropTypes.func.isRequired,
    refetchTodoList: PropTypes.func.isRequired
  }

  render() {
    const { todos, toggleTodo, refetchTodoList } = this.props

    return (
      <div className="ui main text container main-content">
        <h1>Todo Example (GraphQL watchQuery)</h1>
        <AddTodo refetchTodoList={refetchTodoList} />
        <Divider />
        <TodoList todos={todos} onTodoClick={toggleTodo} />
      </div>
    )
  }
}

const todoListQuery = gql`
  query todoListQuery {
    todoList {
      todos {
        id
        text
        completed
      }
    }
  }
`

const toggleTodoMutation = gql`
  mutation toggleTodo($id: String!) {
    toggleTodo(id: $id) {
      completed
    }
  }
`

const mergeProps = (stateProps, dispatchProps, ownProps) => (
  Object.assign({}, ownProps, {
    todos: ownProps.todos,
    toggleTodo: ownProps.toggleTodo,
    refetchTodoList: ownProps.refetchTodoList
  })
)

export default compose(
  graphql(todoListQuery, {
    props: ({ data }) => {
      const { loading, refetch, todoList } = data
      return {
        todoListLoading: loading,
        refetchTodoList: refetch,
        todos: fromJS(todoList ? todoList.todos : [])
      }
    },
    options: { pollInterval: 20000 }
  }),
  graphql(toggleTodoMutation, {
    props: ({ ownProps, mutate }) => ({
      toggleTodo(id) {
        mutate({ variables: { id } })
          .then(() => {
            ownProps.refetchTodoList()
          })
          .catch(() => {
            // console.error('mutation error', error)
          })
      }
    })
  }),
  connect(null, null, mergeProps)
)(RemoteTodoApp)
