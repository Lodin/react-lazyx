import {mount, shallow} from 'enzyme';
import {Store} from 'lazyx';
import * as React from 'react';
import Provider, {createProvider} from '../../src/components/Provider';
import {storeShape} from '../../src/utils/propTypes';

describe('Component <Provider>', () => {
  let store: Store;
  let consoleErrorOriginal: Function;
  let consoleError: jasmine.Spy;

  beforeAll(() => {
    consoleErrorOriginal = console.error;
  });

  afterAll(() => {
    (console as any).error = consoleErrorOriginal;
  });

  beforeEach(() => {
    consoleError = spyOn(console, 'error').and.callThrough();

    store = jasmine.createSpyObj('Store', ['attach', 'getTree']);
  });

  it('should compile well with single child', () => {
    consoleError.and.returnValue(null);

    expect(() => (
      shallow(
        <Provider store={store}>
          <div/>
        </Provider>,
      )
    )).not.toThrow();

    consoleError.and.callThrough();
  });

  it('should throw an error if there is no children', () => {
    consoleError.and.returnValue(null);

    expect(() => (
      shallow(
        <Provider store={store}>
        </Provider>,
      )
    )).toThrowError(/a single React element child/);

    consoleError.and.callThrough();
  });

  it('should throw an error if there are many children', () => {
    consoleError.and.returnValue(null);

    expect(() => (
      shallow(
        <Provider store={store}>
          <div/>
          <div/>
        </Provider>,
      )
    )).toThrowError(/a single React element child/);

    consoleError.and.callThrough();
  });

  it('should provide Lazyx store to the children', () => {
    const Child = jasmine.createSpy('ChildComponent').and.returnValue(<div/>);
    (Child as any).contextTypes = {store: storeShape.isRequired};

    mount(
      <Provider store={store}>
        <Child />
      </Provider>,
    );

    expect(Child).toHaveBeenCalledWith(jasmine.anything(), {store}, jasmine.anything());
  });

  describe('if store changes', () => {
    const createProviderContainer =
      (ProviderImpl: any) =>
        class ProviderContainer extends React.Component<any, any> {
          public state = {store};

          public render(): React.ReactElement<any> {
            return (
              <ProviderImpl store={this.state.store}>
                <div/>
              </ProviderImpl>
            );
          }
        };

    let store2: Store;

    beforeEach(() => {
      consoleError.and.returnValue(null);
      store2 = jasmine.createSpyObj('StoreSecond', ['attach', 'getTree']);
    });

    afterEach(() => {
      consoleError.and.callThrough();
    });

    it('should display error in console if NODE_ENV is not "production"', () => {
      const ProviderContainer = createProviderContainer(Provider);

      const container = mount(<ProviderContainer/>);
      container.setState({store: store2});

      expect(consoleError)
        .toHaveBeenCalledWith('<Provider> does not support changing `store` on the fly.');
    });

    it('should not display error if NODE_ENV is "production"', () => {
      const ProviderContainer = createProviderContainer(createProvider('production'));

      const container = mount(<ProviderContainer/>);
      container.setState({store: store2});

      expect(consoleError).not.toHaveBeenCalled();
    });

    it('should not display error if store is equal to previous', () => {
      const ProviderContainer = createProviderContainer(Provider);

      const container = mount(<ProviderContainer/>);
      container.setState({store});

      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
