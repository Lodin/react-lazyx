import * as PropTypes from 'prop-types';
import ConnectImpl from '../components/ConnectImpl';
import {ComponentDecorator, IWrappedComponent, MapTransformersToProps, TransformersMap} from '../utils/types';

export type TransformersProp = {
  transformers: TransformersMap,
};

export default function connectDynamically<TMappedProps, TWrappeeProps>(
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TWrappeeProps>,
): ComponentDecorator<TMappedProps, TWrappeeProps & TransformersProp, TWrappeeProps> {
  // tslint:disable-next-line:typedef no-function-expression
  return function wrapWitnDynamicConnect(WrappedComponent: IWrappedComponent<TMappedProps, TWrappeeProps>): any {
    return class DynamicConnect extends ConnectImpl<TWrappeeProps & TransformersProp, TWrappeeProps, TMappedProps, null> {
      public static displayName = `DynamicConnect(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

      public static propTypes = {
        transformers: PropTypes.object.isRequired,
      };

      constructor(props?: TWrappeeProps & TransformersProp, context?: any) {
        super(props, context, WrappedComponent);
      }

      public componentDidMount(): void {
        const {transformers: map, ...others} = (this.props as any);
        super.componentDidMountImpl(map, others, mapTransformersToProps);
      }

      public render(): JSX.Element | null {
        const {transformers, ...props} = (this.props as any);

        return this.renderImpl(props);
      }
    };
  };
}
