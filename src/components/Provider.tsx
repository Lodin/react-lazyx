import {Store} from 'lazyx';
import * as PropTypes from 'prop-types';
import {ChildContextProvider, Children, Component, ReactChildren, ReactElement} from 'react';
import {storeShape} from '../utils/propTypes';
import {StoreContainer} from '../utils/types';

export type ProviderProps = StoreContainer & {
  children: ReactChildren;
};

type ProviderState = null;

export default class Provider
  extends Component<ProviderProps, ProviderState>
  implements ChildContextProvider<StoreContainer> {

  public static propTypes = {
    children: PropTypes.element.isRequired,
    store: storeShape.isRequired,
  };

  public static childContextTypes = {
    store: storeShape.isRequired,
  };

  public props: ProviderProps;
  private store: Store;

  public constructor(props: ProviderProps, context?: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext(): StoreContainer {
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
