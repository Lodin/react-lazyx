import {Dictionary} from './types';

export default function mapCombinedValuesFactory(keys: string[]): Dictionary<any> {
  // tslint:disable-next-line:typedef no-function-expression
  return function mapCombinedValues(...values: any[]) {
    const result: Dictionary<any> = {};

    for (let i = 0, len = keys.length; i < len; i += 1) {
      result[keys[i]] = values[i];
    }

    return result;
  };
}
