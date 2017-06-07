import * as React from 'react';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';
import {Component, Dictionary, MapTransformersToProps, TransformersMap, WrappedComponentProps} from '../utils/types';

export default class ConnectImpl<TOwnProps, TMappedProps, TContext> extends React.Component<TOwnProps, TMappedProps> {
  public context: TContext;
  private subscription: Subscription;

  constructor(
    props: TOwnProps | undefined,
    context: TContext | undefined,
    protected WrappedComponent: Component<WrappedComponentProps<TMappedProps, TOwnProps>>,
  ) {
    super(props, context);
  }

  protected componentDidMountImpl<T extends TOwnProps>(
    map: TransformersMap,
    ownProps: T,
    mapTransformersToProps?: MapTransformersToProps<TMappedProps, TOwnProps>,
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

  public componentWillUnmount(): void {
    this.subscription.unsubscribe();
  }

  public render(): React.ReactElement<WrappedComponentProps<TOwnProps, TMappedProps>> {
    const {WrappedComponent} = this;

    return <WrappedComponent {...this.props} {...this.state}/>;
  }
}
