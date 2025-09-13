import { gql } from "../../__generated__";

export const USER_CREATE = gql(`
  mutation UserCreate($input: UserCreateInput!) {
    userCreate(input: $input) {
      id
    }
  }
`);

export const USER_UPDATE = gql(`
  mutation UserUpdate($input: UserUpdateInput!) {
    userUpdate(input: $input) {
      id
    }
  }
`);

export const USER_DESTROY = gql(`
  mutation UserDestroy($input: UserDestroyInput!) {
    userDestroy(input: $input) {
      id
    }
  }
`);
