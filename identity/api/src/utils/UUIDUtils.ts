import uuidValidate from 'uuid-validate';
import { APIError } from './ResponseUtils';

export default class UUIDUtils {
  static validate(uuid: string, type: string): string {
    if (!uuidValidate(uuid)) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: `INVALID_${type}_ID`,
          message: `${uuid} is not a valid uuid.`,
          causes: [],
        },
      });
    }
    return uuid;
  }
}
