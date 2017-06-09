import ConnectImpl from '../components/ConnectImpl';
import {storeShape} from '../utils/propTypes';
import {ComponentDecorator, IWrappedComponent, MapTransformersToProps, StoreContainer, TransformersMap} from '../utils/types';

export type MapTreeToTransformers<TTransformers extends TransformersMap> = (tree: any) => TTransformers;

export default function connect<TTransformers extends TransformersMap, TMappedProps, TOwnProps>(
  mapTreeToTransformers: MapTreeToTransformers<TTransformers>,
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps, TOwnProps, TOwnProps> {
  // tslint:disable-next-line:no-function-expression
  return function wrapWithConnect(WrappedComponent: IWrappedComponent<TMappedProps, TOwnProps>): any {
    return class Connect extends ConnectImpl<TOwnProps, TOwnProps, TMappedProps, StoreContainer> {
      public static displayName = `Connect(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

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

      public render(): JSX.Element | null {
        return this.renderImpl(this.props);
      }
    };
  };
}
