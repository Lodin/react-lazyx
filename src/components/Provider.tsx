import {Store} from 'lazyx';
import * as PropTypes from 'prop-types';
import {ChildContextProvider, Children, Component, ReactChildren, ReactElement} from 'react';
import {storeShape} from '../utils/propTypes';

export interface ProviderProps<T> {
  children: ReactChildren;
  store: Store<T>;
}

export interface ProviderChildContext<T> {
  store: Store<T>;
}

type ProviderState = null;

export default class Provider<T>
  extends Component<ProviderProps<T>, ProviderState>
  implements ChildContextProvider<ProviderChildContext<T>> {

  public static propTypes = {
    children: PropTypes.element.isRequired,
    store: storeShape.isRequired,
  };

  public static childContextTypes = {
    store: storeShape.isRequired,
  };

  public props: ProviderProps<T>;
  private store: Store<T>;

  public constructor(props: ProviderProps<T>, context?: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext(): ProviderChildContext<T> {
    return {store: this.store};
  }

  public render(): ReactElement<any> {
    return Children.only(this.props.children);
  }
}

if (process.env.NODE_ENV !== 'production') {
  (Provider as any).prototype.componentWillReceiveProps = function (nextProps: any): void {
    if (this.store !== nextProps.store) {
      throw new Error('<Provider> does not support changing `store` on the fly.');
    }
  };
}
