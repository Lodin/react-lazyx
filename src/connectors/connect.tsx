import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import {storeShape} from '../utils/propTypes';
import {StoreContext} from '../utils/types';

type ComponentClass<P> = React.ComponentClass<P>;
type StatelessComponent<P> = React.StatelessComponent<P>;
type Component<P> = ComponentClass<P> | StatelessComponent<P>;

type ComponentDecorator<TMergedProps> =
  <TOwnProps>(component: Component<(TOwnProps & TMergedProps) | TOwnProps>) => ComponentClass<TOwnProps>;

type MapTreeToTransformers = (tree: any) => { [key: string]: Observable<any> };
type MapTransformersToProps<TMappedProps, TOwnProps> = (receivedProps: any, ownProps: TOwnProps) => TMappedProps;

type ConnectState = {};

export default function connect<TMappedProps, TOwnProps>(
  mapTreeToTransformers: MapTreeToTransformers,
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps> {
  return WrappedComponent => class Connect extends React.Component<TOwnProps, ConnectState> {
    public static contextTypes = {
      store: storeShape.isRequired,
    };

    public props: TOwnProps;
    public context: StoreContext<any>;

    private subscription: Subscription;

    public componentDidMount(): void {
      const [keys, transformers] = getEntries(mapTreeToTransformers(this.context.store.getTree()));

      const combined = combineLatest.call(Observable, transformers, (...values) => {
        const result = {};

        for (let i = 0, len = keys.length; i < len; i += 1) {
          result[keys[i]] = values[i];
        }

        return result;
      });

      this.subscription = combined.subscribe(values => this.setState(mapTransformersToProps(values, this.props)));
    }

    public componentWillUnmount(): void {
      this.subscription.unsubscribe();
    }

    public render(): React.ReactElement<(TOwnProps & TMappedProps) | TOwnProps> {
      return <WrappedComponent {...(this.props as any)} {...this.state}/>;
    }
  };
}

function getEntries(transformers: { [key: string]: Observable<any> }): [string[], Observable<any>[]] {
  const keys = Object.keys(transformers);
  const result = new Array(keys.length);

  for (let i = 0, len = keys.length; i < len; i += 1) {
    result[i] = transformers[keys[i]];
  }

  return [keys, result];
}
