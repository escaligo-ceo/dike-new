export interface IAuthResponse {
  access_token: string;
  refresh_token: string;
  user_profile: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
  defaultRedirectUrl: string;
}

export interface RegisterUserDto {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}
