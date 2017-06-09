import {mount, shallow} from 'enzyme';
import {createStore, Store} from 'lazyx/commonjs';
import * as React from 'react';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/merge';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import connect from '../../src/connectors/connect';

describe('Decorator "connect"', () => {
  let container: jasmine.Spy;
  let globalStore: Store;
  let trigger: Subject<string>;

  beforeEach(() => {
    container = jasmine.createSpy('ContainerComponent').and.returnValue(null);

    trigger = new Subject();

    globalStore = createStore({
      foo: Observable.of('test').merge(trigger),
    });
  });

  it('should receive the store in the context', () => {
    const Connected = connect(
      tree => ({foo: tree.foo}),
    )(container);

    const connected = shallow(<Connected />, {
      context: {
        store: globalStore,
      },
    });

    expect(connected.context()).toEqual({store: globalStore});
  });

  it('should send mapped properties to the wrapped component', () => {
    const Connected = connect(
      tree => ({foo: tree.foo}),
    )(container);

    const connectedComponentDidMount = spyOn(Connected.prototype, 'componentDidMount').and.callThrough();

    mount(<Connected/>, {
      context: {
        store: globalStore,
      },
    });

    expect(connectedComponentDidMount).toHaveBeenCalled();
    expect(container).toHaveBeenCalledWith({foo: 'test'}, jasmine.anything(), jasmine.anything());
  });

  it('should subscribe component to store updates', () => {
    const Connected = connect(
      tree => ({foo: tree.foo}),
    )(container);

    mount(<Connected/>, {
      context: {
        store: globalStore,
      },
    });

    expect(container).toHaveBeenCalledTimes(2);

    trigger.next('baz');

    expect(container).toHaveBeenCalledTimes(3);
    expect(container).toHaveBeenCalledWith({foo: 'baz'}, jasmine.anything(), jasmine.anything());
  });

  it('should apply "mapTransformersToProps" function to received values', () => {
    const Connected = connect(
      tree => ({foo: tree.foo}),
      ({foo}) => ({foo: `${foo}+bar`}),
    )(container);

    mount(<Connected/>, {
      context: {
        store: globalStore,
      },
    });

    expect(container).toHaveBeenCalledWith({foo: 'test+bar'}, jasmine.anything(), jasmine.anything());

    trigger.next('baz');

    expect(container).toHaveBeenCalledWith({foo: 'baz+bar'}, jasmine.anything(), jasmine.anything());
  });

  it('should destroy subscription if the component is unmounted', () => {
    const Connected = connect(
      tree => ({foo: tree.foo}),
    )(container);

    const connectedComponentWillUnmount = spyOn(Connected.prototype, 'componentWillUnmount').and.callThrough();

    const mounted = mount(<Connected/>, {
      context: {
        store: globalStore,
      },
    });

    mounted.unmount();

    expect(connectedComponentWillUnmount).toHaveBeenCalled();

    trigger.next('baz');

    expect(container).not.toHaveBeenCalledWith({foo: 'baz'}, jasmine.anything(), jasmine.anything());
  });
});
