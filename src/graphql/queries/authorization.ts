import { gql } from "../../__generated__";

export const GET_AUTHORIZATION = gql(`
  query GetAuthorization {
    authorization {
      canCreateUser {
        value
      }
      canIndexUsers {
        value
      }
    }
  }
`);
