import { KeycloakTokenParsed } from './keycloak'

export const mockUser = {
  exp: 1719866987,
  iat: 1719866687,
  jti: '607c488f-6e18-4455-8384-161cec4f1940',
  iss: 'http://localhost:8180/auth/realms/webapp',
  aud: 'account',
  sub: '5795ea9e-ac11-436b-b97d-7b03dbd863f2',
  typ: 'Bearer',
  azp: 'jwt-headless',
  session_state: 'def317ff-0043-4509-ade3-926dd155085e',
  'allowed-origins': ['*'],
  realm_access: { roles: ['default-roles-webapp', 'offline_access', 'uma_authorization'] },
  resource_access: {
    account: { roles: ['manage-account', 'manage-account-links', 'view-profile'] },
  },
  scope: 'openid profile email',
  sid: 'def317ff-0043-4509-ade3-926dd155085e',
  email_verified: 'true',
  name: 'asdasd sdfsdfsdfs',
  preferred_username: 'martbul01@gmail.com',
  given_name: 'asdasd',
  family_name: 'sdfsdfsdfs',
  email: 'martbul01@gmail.com',
} as KeycloakTokenParsed

export const mockUserAdmin = {
  exp: 1719866987,
  iat: 1719866687,
  jti: '607c488f-6e18-4455-8384-161cec4f1940',
  iss: 'http://localhost:8180/auth/realms/webapp',
  aud: 'account',
  sub: '5795ea9e-ac11-436b-b97d-7b03dbd863f2',
  typ: 'Bearer',
  azp: 'jwt-headless',
  session_state: 'def317ff-0043-4509-ade3-926dd155085e',
  'allowed-origins': ['*'],
  realm_access: { roles: ['default-roles-webapp', 'offline_access', 'uma_authorization'] },
  resource_access: { account: { roles: ['manage-account', 'account-view-supporters'] } },
  scope: 'openid profile email',
  sid: 'def317ff-0043-4509-ade3-926dd155085e',
  email_verified: 'true',
  name: 'asdasd sdfsdfsdfs',
  preferred_username: 'martbul01@gmail.com',
  given_name: 'asdasd',
  family_name: 'sdfsdfsdfs',
  email: 'martbul01@gmail.com',
} as KeycloakTokenParsed
