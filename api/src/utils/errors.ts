export class HandledError {
  static list = {
    'discovery|auth_endpoint|404': new HandledError(
      'Discovery',
      'authorization_endpoint not found',
      404
    ),
    'id_token|failed_claims|404': new HandledError(
      'ID_Token',
      'Failed to find valid token claims',
      404
    ),
    'signin|wrong_email|404': new HandledError(
      'SignInError',
      'Email not found',
      404
    ),
    'signin|wrong_credential|401': new HandledError(
      'SignInError',
      'Wrong email or password',
      401
    ),
    'session|no_refresh_token|401': new HandledError(
      'SessionError',
      'No refresh_token provided',
      401
    ),
    'session|invalid_refresh_token|401': new HandledError(
      'SessionError',
      'Invalid refresh_token',
      401
    ),
    'session|expired|403': new HandledError(
      'SessionError',
      'Session expired',
      403
    ),
    'auth|no_at|401': new HandledError('AuthError', 'No access_token', 401),
    'auth|invalid_at|401': new HandledError(
      'AuthError',
      'Invalid access_token',
      401
    ),
    'auth|at_expired|403': new HandledError(
      'AuthError',
      'access_token expired',
      403
    ),
    'auth|no_permission|403': new HandledError(
      'AuthError',
      'No role permission to access',
      403
    ),
    'auth|wrong_userid|404': new HandledError(
      'AuthError',
      'User Id in access_token not found',
      404
    ),
    'param|wrong_id|404': new HandledError(
      'ParametersError',
      'Id in request parameters not found',
      404
    ),
    'req|wrong_id|404': new HandledError(
      'RequestBodyError',
      'Id in request body or query not found',
      404
    ),
    'req|wrong_orgid|404': new HandledError(
      'RequestBodyError',
      'OrgId in request body or query not found',
      404
    ),
    'req|wrong_name|404': new HandledError(
      'RequestBodyError',
      'Name in request body or query not found',
      404
    ),
  };

  errmsg: string;
  statusCode: number;

  constructor(name: string, message: string, statusCode: number) {
    this.errmsg = `${name}: ${message}`;
    this.statusCode = statusCode;
  }
}
