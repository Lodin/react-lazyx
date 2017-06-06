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

export type WrappedComponentProps<TMappedProps, TOwnProps> = (TOwnProps & TMappedProps) | TOwnProps;

export type ComponentDecorator<TMappedProps> =
  <TOwnProps>(component: Component<WrappedComponentProps<TMappedProps, TOwnProps>>) => ComponentClass<TOwnProps>;

export type MapTransformersToProps<TMappedProps, TOwnProps> = (receivedProps: any, ownProps: TOwnProps) => TMappedProps;
