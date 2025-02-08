import type { Timestamp_Client, Timestamp_Server } from './asset';

export type UserRole = 'org.admin' | 'org.operator' | 'sys.xiaoer';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
}
export interface User_Client extends UserProfile, Timestamp_Client {
  _id: string;
  orgId?: string;
}
export interface User_Server extends UserProfile, Timestamp_Server {
  role: UserRole;
  password: string;
}

export interface UserAuth {
  accessToken: string;
  expiredAt: number;
  role: UserRole;
}

export interface TokenRefresh_Response {
  auth: UserAuth;
  profile: User_Client;
}

export type SignUpFormData = Pick<
  User_Server,
  'email' | 'username' | 'password' | 'role'
> & {
  orgName?: string;
};

export type SignInFormData = Pick<User_Server, 'email' | 'password'>;

export type UpdateUserFormData = Partial<
  Pick<User_Server, 'email' | 'username' | 'password' | 'role'> &
    Pick<SignUpFormData, 'orgName'>
>;
