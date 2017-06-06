import * as React from 'react';
import ConnectImpl from '../components/ConnectImpl';
import {storeShape} from '../utils/propTypes';
import {ComponentDecorator, MapTransformersToProps, StoreContainer, TransformersMap} from '../utils/types';

export type MapTreeToTransformers<TTransformers extends TransformersMap> = (tree: any) => TTransformers;

export default function connect<TTransformers extends TransformersMap, TMappedProps, TOwnProps>(
  mapTreeToTransformers: MapTreeToTransformers<TTransformers>,
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps> {
  // tslint:disable-next-line:typedef no-function-expression
  return function wrapWithConnect(WrappedComponent) {
    return class Connect extends ConnectImpl<TOwnProps, TMappedProps, StoreContainer> {
      public static contextTypes = {
        store: storeShape.isRequired,
      };

      constructor(props?: TOwnProps, context?: StoreContainer) {
        super(props, context, WrappedComponent);
      }

      public componentDidMount(): void {
        const tree = this.context.store.getTree();
        const map = mapTreeToTransformers(tree);

        super.componentDidMountImpl(map, this.props, mapTransformersToProps);
      }
    };
  };
}
