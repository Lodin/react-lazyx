import * as PropTypes from 'prop-types';
import {Observable} from 'rxjs/Observable';

export const storeShape = PropTypes.shape({
  attach: PropTypes.func.isRequired,
  getTree: PropTypes.func.isRequired,
});

export const transformersMap = PropTypes.objectOf(PropTypes.instanceOf(Observable));
