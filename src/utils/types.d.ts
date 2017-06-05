import {Store} from 'lazyx';

export interface StoreContext<Tree> {
  store: Store<Tree>;
}
