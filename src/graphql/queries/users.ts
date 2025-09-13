import { gql } from "../../__generated__";

export const GET_USERS_TABLE = gql(`
  query GetUserTable($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {
    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {
      nodes {
        canShow {
          value
        }
        canUpdate {
          value
        }
        canDestroy {
          value
        }
        id
        email
        role
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`);

export const GET_USER_DETAIL = gql(`
  query GetUserDetail($id: String!) {
    user(id: $id) {
      id
      email
      role
    }
  }
`);

export const GET_USER_OPTIONS = gql(`
  query GetUserOptions($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {
    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {
      nodes {
        id
        email
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`);
