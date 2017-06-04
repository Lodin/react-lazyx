import * as PropTypes from 'prop-types';

export const storeShape = PropTypes.shape({
  attach: PropTypes.func.isRequired,
  getTree: PropTypes.func.isRequired,
});
