# react-lazyx

[![Latest Stable Version](https://img.shields.io/npm/v/react-lazyx.svg)](https://www.npmjs.com/package/react-lazyx)
[![License](https://img.shields.io/npm/l/react-lazyx.svg)](./LICENSE)
[![Build Status](https://img.shields.io/travis/poetez/react-lazyx/master.svg)](https://travis-ci.org/poetez/react-lazyx)
[![Test Coverage](https://img.shields.io/codecov/c/github/poetez/react-lazyx/master.svg)](https://codecov.io/gh/poetez/react-lazyx)

React bindings for [Lazyx](https://github.com/poetez/lazyx).

**Note**: It is an alpha release. API might change any time. Don't use in the production. 

## Installation 
```bash
$ npm install --save lazyx react-lazyx
```

## API
### Provider
`Provider` is a React component that makes Lazyx store available for `connect` calls in the component hierarchy below. 

#### Props
* `store` - single instance of Lazyx Store. It does not allowed to send new store to the `Provider` during application 
lifecycle. 

#### Example
```typescript jsx
ReactDOM.render(
  <Provider store={store}>
    <MyRootComponent />
  </Provider>,
  document.getElementById('root')
)
```

### connect
`connect` is a function that connects custom React component to the Lazyx store. It has following signature:
```typescript
type MapTreeToTransformers = (tree: any) => {[key: string]: Observable<any>};
type MapTransformersToProps = <T>(receivedDataMap: {[key: string]: any}, ownProps: T) => ({[key: string]: any});

function connect(mapTreeToTransformers: MapTreeToTransformers, mapTransformersToProps?: MapTransformersToProps): React.Component;
```

#### Arguments
* `mapTreeToTransformers` - this argument receives a function that defines what transformers you want to subscribe your 
component to. It means that the component will be redrawn if the new value is emitted by transformer. 
* `mapTransformersToProps` - this argument is additional. It receives a function that defines what part of value 
emitted by transformer will be received as a prop by component. If this argument is not specified, values will be sent 
as is. If the result object does not have some emitted values, they will be excluded from props. 

#### Example
```typescript
@connect(
  tree => ({
    todos: tree.todos,
    someAnotherTransformer: tree.someAnotherTransformer
  }),
  ({todos, someAnotherTransformer}) => ({ // someAnotherTransformer is now just a value emitted by real someAnotherTransformer
    todos,
    someElement: someAnotherTransformer.someElement
  })
)
export class MyTodosComponent extends React.Component {}
```

### connectDynamically
`connectDynamically` is a function that connects custom React component to the dynamic elements of the Lazyx store, like arrays 
of transformers, by receiving them as props and subscribing to them. Function signature is following:
```typescript
function connectDynamically(mapTransformersToProps?: MapTransformersToProps): React.Component;
```
The result component has additional property `transformers` that receives map of transformers. 

#### Arguments
* `mapTransformersToProps` - if this argument is defined, it receives function that is same to `mapTransformersToProps`
of `connect` function. 

#### Examples 
```typescript jsx
@connectDynamically(
  ({todo}) => ({
    name: todo.name
  })
)
export class MyTodoComponent extends React.Component {}

ReactDOM.render(
  <MyTodoComponent transformers={{todo: tree.todos[0]}} />,
  document.getElementById('root')
)
```

## License
[MIT](./LICENSE)