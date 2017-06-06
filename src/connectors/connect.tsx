import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import keysAndValues from '../utils/keysAndValues';
import mapCombinedValuesFactory from '../utils/mapCombinedValues';
import {storeShape} from '../utils/propTypes';
import {ComponentDecorator, MapTransformersToProps, StoreContainer, TransformersMap} from '../utils/types';


export type MapTreeToTransformers<TTransformers extends TransformersMap> = (tree: any) => TTransformers;

export default function connect<TTransformers extends TransformersMap, TMappedProps, TOwnProps>(
  mapTreeToTransformers: MapTreeToTransformers<TTransformers>,
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps> {
  // tslint:disable-next-line:typedef no-function-expression
  return function wrapWithConnect(WrappedComponent) {
    return class Connect extends React.Component<TOwnProps, TMappedProps> {
      public static contextTypes = {
        store: storeShape.isRequired,
      };

      public context: StoreContainer;

      private subscription: Subscription;

      public componentDidMount(): void {
        const tree = this.context.store.getTree();
        const map = mapTreeToTransformers(tree);

        const [keys, transformers] = keysAndValues(map);

        const combined = combineLatest.call(Observable, transformers, mapCombinedValuesFactory(keys));

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
