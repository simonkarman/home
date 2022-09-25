import { APIError, Location } from './ResponseUtils';

export const asString = (value: unknown, name: string, location: Location): string => {
  if (typeof value !== 'string') {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: `${name} is not provided correctly`,
        causes: [{ message: 'not a string', path: name, location: location }],
      },
    });
  }
  return value;
};

export const asNumber = (value: unknown, name: string, location: Location): number => {
  const result = Number.parseInt(asString(value, name, location), 10);
  if (isNaN(result)) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: `${name} has an incorrect value`,
        causes: [{ message: 'should be a number', path: name, location: location }],
      },
    });
  }
  return result;
};

export const asStringArray = (values: unknown, name: string, location: Location): string[] => {
  if (!Array.isArray(values) || !values.every(value => typeof value === 'string')) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: `${name} is not provided correctly`,
        causes: [{ message: 'not an array of strings', path: name, location: location }],
      },
    });
  }
  return values;
};
