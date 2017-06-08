import {Store} from 'lazyx';
import {ComponentClass, StatelessComponent} from 'react';
import {Observable} from 'rxjs/Observable';

export interface Dictionary<T> {
  [key: string]: T;
}

export interface StoreContainer {
  store: Store;
}

export type TransformersMap = { [key: string]: Observable<any> };

export type Component<P> = ComponentClass<P> | StatelessComponent<P>;

export type IWrappedComponent<TMappedProps, TOwnProps> = Component<(TOwnProps & TMappedProps) | TOwnProps>;

export type ComponentDecorator<TMappedProps, TWrapperProps, TWrappeeProps> =
  (component: IWrappedComponent<TMappedProps, TWrappeeProps>) => ComponentClass<TWrapperProps>;

export type MapTransformersToProps<TMappedProps, TOwnProps> = (receivedProps: any, ownProps: TOwnProps) => TMappedProps;
