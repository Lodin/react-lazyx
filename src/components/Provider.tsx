import {Store} from 'lazyx';
import * as PropTypes from 'prop-types';
import {ChildContextProvider, Children, Component} from 'react';
import {storeShape} from '../utils/propTypes';
import {StoreContainer} from '../utils/types';

export function createProvider(env: string): any {
  class Provider
    extends Component<StoreContainer, null>
    implements ChildContextProvider<StoreContainer> {

    public static propTypes = {
      children: PropTypes.element.isRequired,
      store: storeShape.isRequired,
    };

    public static childContextTypes = {
      store: storeShape.isRequired,
    };

    private store: Store;

    public constructor(props: StoreContainer, context?: any) {
      super(props, context);
      this.store = props.store;
    }

    public getChildContext(): StoreContainer {
      return {store: this.store};
    }

    public render(): JSX.Element | null {
      return Children.only(this.props.children);
    }
  }

  if (env !== 'production') {
    (Provider as any).prototype.componentWillReceiveProps = function (nextProps: any): void {
      if (this.store !== nextProps.store) {
        console.error('<Provider> does not support changing `store` on the fly.');
      }
    };
  }

  return Provider;
}

export default createProvider(process.env.NODE_ENV);
