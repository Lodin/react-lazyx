import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import {Dictionary, IWrappedComponent, MapTransformersToProps, TransformersMap} from '../utils/types';

export default class ConnectImpl<TWrapperProps, TWrappeeProps, TMappedProps, TContext>
  extends React.Component<TWrapperProps, TMappedProps> {

  public context: TContext;
  private subscription: Subscription;

  constructor(
    props: TWrapperProps | undefined,
    context: TContext | undefined,
    protected WrappedComponent: IWrappedComponent<TMappedProps, TWrappeeProps>,
  ) {
    super(props, context);
  }

  public componentWillUnmount(): void {
    this.subscription.unsubscribe();
  }

  protected componentDidMountImpl<T extends TWrappeeProps>(
    map: TransformersMap,
    ownProps: T,
    mapTransformersToProps?: MapTransformersToProps<TMappedProps, TWrappeeProps>,
  ): void {
    const keys = Object.keys(map);
    const transformers = new Array(keys.length);

    for (let i = 0, len = keys.length; i < len; i += 1) {
      transformers[i] = map[keys[i]];
    }

    const combined = combineLatest.call(Observable, transformers, (...values: any[]) => {
      const result: Dictionary<any> = {};

      for (let i = 0, len = keys.length; i < len; i += 1) {
        result[keys[i]] = values[i];
      }

      return result;
    });

    this.subscription = combined.subscribe((values: any) => {
      const mappedProps = mapTransformersToProps ? mapTransformersToProps(values, ownProps) : values;
      this.setState(mappedProps);
    });
  }

  protected renderImpl(props: TWrappeeProps): JSX.Element | null {
    const {WrappedComponent} = this;

    return <WrappedComponent {...props} {...this.state}/>;
  }
}
