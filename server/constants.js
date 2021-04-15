
module.exports = {
  SOCKET_AUTH_CHECK: true,
  OTHER: {
    PERMISSIONS: {
      USER_INIT: 1,
      CREATE_ROLE: 6,
      CREATE_PERMISSIONS: 5,
      GET_PERMISSIONS: 3,
      GET_ROLES: 2,
      ADD_ROLES: 9,
      GET_USERS: 7,
      ADD_PERMISSIONS_TO_USER: 10,
      ADD_PERMISSIONS_TO_ROLE: 11,
      GET_PERMISSIONS_OF_USER: 8,
    }
  },
  TYPES_OF_CARDS: ["TO_BUY", "TO_SELL"],
  TYPES_OF_ANSWER: ["CHECKBOX", "TOGGLE", "TEXT"],
  TOKEN_EXPIRATION: 3600,
  OUR_EMAIL: "admin@examinator.com",
  URL_TO_VALIDATION_EMAIL: "http://localhost:8100/verify",
  // URL_TO_VALIDATION_EMAIL: "http://176.9.139.200/verify",
  URL_TO_FORGOT_PASSWORD: "http://176.9.139.200/forgot_password",
  NON_AUTH_URLS: [
    // "/v1/auth",
    "/v1/verify",
    "/v1/forgot_password",
    "/v1/change_pass_as_forgot",
    "/version",
  ],
  BASE_GMAIL: "example@gmail.com",
  BASE_GMAIL_PASS: "example_pass",
  listAccessIp: ["127.0.0.1", "142.44.184.181", "178.149.87.156", "178.17.21.179"],
  loginRegexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  passwordRegexp: /(\S+)/,

  defaultPermissionsList: [
    {code: 1, description: "default permission to init all users"},
    {code: 2, description: "permission to read roles"},
    {code: 3, description: "permission to read permissions"},
    {code: 5, description: "permission to write permissions"},
    {code: 6, description: "permission to write roles"},
    {code: 7, description: "permission to read users"},
    {code: 8, description: "permission to read permissions of user"},
    {code: 9, description: "permission to set role to user"},
    {code: 10, description: "permission to set permissions to user"},
    {code: 11, description: "permission to set permissions to role"},
  ],

  defaultCategoriesList: [
  ],
  defaultAdminRole: {position: "admin", description: "role which have all permissions"}
}
