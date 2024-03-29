import bcrypt from 'bcrypt';
import basicAuth, { IBasicAuthedRequest } from 'express-basic-auth';
import { userService } from '../services/user-service';
import { UnauthorizedBody } from './ResponseUtils';

const authorizer: basicAuth.AsyncAuthorizer = async (username, givenPassword, callback) => {
  try {
    const user = await userService.findByUsername(username);
    if (user === undefined) {
      callback(undefined, false);
      return;
    }
    const { password } = user;
    const isAuthorized = await bcrypt.compare(givenPassword, password);
    callback(undefined, isAuthorized);
  } catch (error) {
    callback(error, false);
  }
};

export default basicAuth({
  unauthorizedResponse: (req: IBasicAuthedRequest): UnauthorizedBody => ({
    code: 'UNAUTHORIZED',
    message: req.auth?.user === undefined
      ? 'Basic authentication failed since no auth was provided'
      : `Basic authentication failed for ${req.auth.user}. Either the user does not exist, or the password is incorrect.`,
  }),
  authorizeAsync: true,
  authorizer,
  realm: 'Karman',
});
