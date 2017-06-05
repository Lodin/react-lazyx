import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import {storeShape} from '../utils/propTypes';
import {StoreContainer} from '../utils/types';

type ComponentClass<P> = React.ComponentClass<P>;
type StatelessComponent<P> = React.StatelessComponent<P>;
type Component<P> = ComponentClass<P> | StatelessComponent<P>;

type ComponentDecorator<TMappedProps, TOwnProps> =
  (component: Component<(TOwnProps & TMappedProps) | TOwnProps>) => ComponentClass<TOwnProps>;

type TransformersMap = { [key: string]: Observable<any> };
type MapTreeToTransformers<TTransformers extends TransformersMap> = (tree: any) => TTransformers;
type MapTransformersToProps<TMappedProps, TOwnProps> = (receivedProps: any, ownProps: TOwnProps) => TMappedProps;

export default function connect<TTransformers extends TransformersMap, TMappedProps, TOwnProps>(
  mapTreeToTransformers: MapTreeToTransformers<TTransformers>,
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps, TOwnProps> {
  // tslint:disable-next-line:typedef
  return function wrapWithConnect(WrappedComponent) {
    return class Connect extends React.Component<TOwnProps, TMappedProps> {
      public static contextTypes = {
        store: storeShape.isRequired,
      };

      public props: TOwnProps;
      public context: StoreContainer;

      private subscription: Subscription;

      public componentDidMount(): void {
        const tree = this.context.store.getTree();
        const map = mapTreeToTransformers(tree);

        const [keys, transformers] = keysAndValues(map);

        const combined = combineLatest.call(Observable, transformers, (...values) => {
          const result = {};

          for (let i = 0, len = keys.length; i < len; i += 1) {
            result[keys[i]] = values[i];
          }

          return result;
        });

        this.subscription = combined.subscribe((values) => {
          const mappedProps = mapTransformersToProps(values, this.props);
          this.setState(mappedProps);
        });
      }

      public componentWillUnmount(): void {
        this.subscription.unsubscribe();
      }

      public render(): React.ReactElement<(TOwnProps & TMappedProps) | TOwnProps> {
        return <WrappedComponent {...this.props} {...this.state}/>;
      }
    };
  };
}

function keysAndValues<TTransformers extends TransformersMap>(transformers: TTransformers): [string[], Observable<any>[]] {
  const keys = Object.keys(transformers);
  const result = new Array(keys.length);

  for (let i = 0, len = keys.length; i < len; i += 1) {
    result[i] = transformers[keys[i]];
  }

  return [keys, result];
}
