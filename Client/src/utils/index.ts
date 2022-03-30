export * from './debug';
export * from './createCustomCursorKeys';

export default class Utils {
  // The ID must start and end with an alphanumeric character (lower or upper case character or a digit). In the middle of the ID spaces, dashes (-) and underscores (_) are allowed.
  static replaceInvalidID(id: string) {
    return id.replace(/[^0-1a-z]/gi, 'G');
  }
}
