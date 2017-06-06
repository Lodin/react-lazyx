import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import keysAndValues from '../utils/keysAndValues';
import mapCombinedValuesFactory from '../utils/mapCombinedValues';
import {ComponentDecorator, MapTransformersToProps, TransformersMap} from '../utils/types';

type TransformersProp = {
  transformers: TransformersMap,
};

export default function connectDynamically<TMappedProps, TOwnProps>(
  mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
): ComponentDecorator<TMappedProps> {
  // tslint:disable-next-line:typedef no-function-expression
  return function wrapWitnDynamicConnect(WrappedComponent) {
    return class DynamicConnect extends React.Component<TOwnProps & TransformersProp, TMappedProps> {
      public static propTypes = {
        transformers: PropTypes.object.isRequired,
      };

      private subscription: Subscription;

      public componentDidMount(): void {
        const {transformers: map, ...others} = (this.props as any);
        const [keys, transformers] = keysAndValues(map);

        const combined = combineLatest.call(Observable, transformers, mapCombinedValuesFactory(keys));

        this.subscription = combined.subscribe((values) => {
          const mappedProps = mapTransformersToProps ? mapTransformersToProps(values, others) : values;
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
