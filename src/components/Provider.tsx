import {Store} from 'lazyx';
import * as PropTypes from 'prop-types';
import {ChildContextProvider, Children, Component, ReactChildren, ReactElement} from 'react';
import {storeShape} from '../utils/propTypes';
import {StoreContext} from '../utils/types';

export interface ProviderProps<Tree> {
  children: ReactChildren;
  store: Store<Tree>;
}

type ProviderState = null;

export default class Provider<Tree>
  extends Component<ProviderProps<Tree>, ProviderState>
  implements ChildContextProvider<StoreContext<Tree>> {

  public static propTypes = {
    children: PropTypes.element.isRequired,
    store: storeShape.isRequired,
  };

  public static childContextTypes = {
    store: storeShape.isRequired,
  };

  public props: ProviderProps<Tree>;
  private store: Store<Tree>;

  public constructor(props: ProviderProps<Tree>, context?: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext(): StoreContext<Tree> {
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
