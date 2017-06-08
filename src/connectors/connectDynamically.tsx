import * as PropTypes from 'prop-types';
import ConnectImpl from '../components/ConnectImpl';
import {ComponentDecorator, IWrappedComponent, MapTransformersToProps, TransformersMap} from '../utils/types';

type TransformersProp = {
  transformers: TransformersMap,
};

export default function connectDynamically<TMappedProps, TOwnProps>(
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps> {
  // tslint:disable-next-line:typedef no-function-expression
  return function wrapWitnDynamicConnect(WrappedComponent: IWrappedComponent<TMappedProps, TOwnProps & TransformersProp>) {
    return class DynamicConnect extends ConnectImpl<TOwnProps & TransformersProp, TMappedProps, null> {
      public static displayName = `DynamicConnect(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

      public static propTypes = {
        transformers: PropTypes.object.isRequired,
      };

      constructor(props?: TOwnProps & TransformersProp, context?: any) {
        super(props, context, WrappedComponent);
      }

      public componentDidMount(): void {
        const {transformers: map, ...others} = (this.props as any);
        super.componentDidMountImpl(map, others, mapTransformersToProps);
      }
    };
  };
}
