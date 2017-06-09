import {mount} from 'enzyme';
import * as React from 'react';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/merge';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import connectDynamically from '../../src/connectors/connectDynamically';
import {TransformersMap} from '../../src/utils/types';

describe('Decorator "connectDynamically"', () => {
  let container: jasmine.Spy;
  let transformers: TransformersMap;
  let trigger: Subject<string>;

  beforeEach(() => {
    container = jasmine.createSpy('ContainerComponent').and.returnValue(null);
    trigger = new Subject();
    transformers = {foo: Observable.of('test').merge(trigger)};
  });

  it('should connect component to a list of transformers', () => {
    const Connected = connectDynamically()(container);

    const connectedComponentDidMount = spyOn(Connected.prototype, 'componentDidMount').and.callThrough();

    mount(<Connected transformers={transformers}/>);

    expect(connectedComponentDidMount).toHaveBeenCalled();
  });

  it('should send transformer values to the wrapped component', () => {
    const Connected = connectDynamically()(container);

    mount(<Connected transformers={transformers}/>);

    expect(container).toHaveBeenCalledWith({foo: 'test'}, jasmine.anything(), jasmine.anything());
  });

  it('should subscribe wrapped component to transformers updates', () => {
    const Connected = connectDynamically()(container);

    mount(<Connected transformers={transformers}/>);

    expect(container).toHaveBeenCalledTimes(2);

    trigger.next('baz');

    expect(container).toHaveBeenCalledTimes(3);
    expect(container).toHaveBeenCalledWith({foo: 'baz'}, jasmine.anything(), jasmine.anything());
  });

  it('should apply "mapTransformersToProps" function to received values', () => {
    const Connected = connectDynamically(
      ({foo}) => ({foo: `${foo}+bar`}),
    )(container);

    mount(<Connected transformers={transformers}/>);

    expect(container).toHaveBeenCalledWith({foo: 'test+bar'}, jasmine.anything(), jasmine.anything());

    trigger.next('baz');

    expect(container).toHaveBeenCalledWith({foo: 'baz+bar'}, jasmine.anything(), jasmine.anything());
  });

  it('should destroy subscription if the component is unmounted', () => {
    const Connected = connectDynamically()(container);
    const connectedComponentWillUnmount = spyOn(Connected.prototype, 'componentWillUnmount').and.callThrough();

    const mounted = mount(<Connected transformers={transformers}/>);

    mounted.unmount();

    expect(connectedComponentWillUnmount).toHaveBeenCalled();

    trigger.next('baz');

    expect(container).not.toHaveBeenCalledWith({foo: 'baz'}, jasmine.anything(), jasmine.anything());
  });
});
