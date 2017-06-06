import {Observable} from 'rxjs/Observable';
import {TransformersMap} from './types';

export default function keysAndValues<TTransformers extends TransformersMap>(transformers: TTransformers): [string[], Observable<any>[]] {
  const keys = Object.keys(transformers);
  const result = new Array(keys.length);

  for (let i = 0, len = keys.length; i < len; i += 1) {
    result[i] = transformers[keys[i]];
  }

  return [keys, result];
}
