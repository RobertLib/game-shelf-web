/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query MockUsers {\n      users: __typename\n    }\n  ": typeof types.MockUsersDocument,
    "\n  query EmptyQuery {\n    __typename\n  }\n": typeof types.EmptyQueryDocument,
    "\n  mutation UserCreate($input: UserCreateInput!) {\n    userCreate(input: $input) {\n      id\n    }\n  }\n": typeof types.UserCreateDocument,
    "\n  mutation UserUpdate($input: UserUpdateInput!) {\n    userUpdate(input: $input) {\n      id\n    }\n  }\n": typeof types.UserUpdateDocument,
    "\n  mutation UserDestroy($input: UserDestroyInput!) {\n    userDestroy(input: $input) {\n      id\n    }\n  }\n": typeof types.UserDestroyDocument,
    "\n  query GetAuthorization {\n    authorization {\n      canCreateUser {\n        value\n      }\n      canIndexUsers {\n        value\n      }\n    }\n  }\n": typeof types.GetAuthorizationDocument,
    "\n  query GetUserTable($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        canShow {\n          value\n        }\n        canUpdate {\n          value\n        }\n        canDestroy {\n          value\n        }\n        id\n        email\n        role\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetUserTableDocument,
    "\n  query GetUserDetail($id: String!) {\n    user(id: $id) {\n      id\n      email\n      role\n    }\n  }\n": typeof types.GetUserDetailDocument,
    "\n  query GetUserOptions($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        id\n        email\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetUserOptionsDocument,
};
const documents: Documents = {
    "\n    query MockUsers {\n      users: __typename\n    }\n  ": types.MockUsersDocument,
    "\n  query EmptyQuery {\n    __typename\n  }\n": types.EmptyQueryDocument,
    "\n  mutation UserCreate($input: UserCreateInput!) {\n    userCreate(input: $input) {\n      id\n    }\n  }\n": types.UserCreateDocument,
    "\n  mutation UserUpdate($input: UserUpdateInput!) {\n    userUpdate(input: $input) {\n      id\n    }\n  }\n": types.UserUpdateDocument,
    "\n  mutation UserDestroy($input: UserDestroyInput!) {\n    userDestroy(input: $input) {\n      id\n    }\n  }\n": types.UserDestroyDocument,
    "\n  query GetAuthorization {\n    authorization {\n      canCreateUser {\n        value\n      }\n      canIndexUsers {\n        value\n      }\n    }\n  }\n": types.GetAuthorizationDocument,
    "\n  query GetUserTable($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        canShow {\n          value\n        }\n        canUpdate {\n          value\n        }\n        canDestroy {\n          value\n        }\n        id\n        email\n        role\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n": types.GetUserTableDocument,
    "\n  query GetUserDetail($id: String!) {\n    user(id: $id) {\n      id\n      email\n      role\n    }\n  }\n": types.GetUserDetailDocument,
    "\n  query GetUserOptions($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        id\n        email\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n": types.GetUserOptionsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query MockUsers {\n      users: __typename\n    }\n  "): (typeof documents)["\n    query MockUsers {\n      users: __typename\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query EmptyQuery {\n    __typename\n  }\n"): (typeof documents)["\n  query EmptyQuery {\n    __typename\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserCreate($input: UserCreateInput!) {\n    userCreate(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation UserCreate($input: UserCreateInput!) {\n    userCreate(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserUpdate($input: UserUpdateInput!) {\n    userUpdate(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation UserUpdate($input: UserUpdateInput!) {\n    userUpdate(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserDestroy($input: UserDestroyInput!) {\n    userDestroy(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation UserDestroy($input: UserDestroyInput!) {\n    userDestroy(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAuthorization {\n    authorization {\n      canCreateUser {\n        value\n      }\n      canIndexUsers {\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetAuthorization {\n    authorization {\n      canCreateUser {\n        value\n      }\n      canIndexUsers {\n        value\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserTable($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        canShow {\n          value\n        }\n        canUpdate {\n          value\n        }\n        canDestroy {\n          value\n        }\n        id\n        email\n        role\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetUserTable($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        canShow {\n          value\n        }\n        canUpdate {\n          value\n        }\n        canDestroy {\n          value\n        }\n        id\n        email\n        role\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserDetail($id: String!) {\n    user(id: $id) {\n      id\n      email\n      role\n    }\n  }\n"): (typeof documents)["\n  query GetUserDetail($id: String!) {\n    user(id: $id) {\n      id\n      email\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserOptions($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        id\n        email\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetUserOptions($filter: UserFilterInput, $sort: UserSortInput, $after: String, $before: String, $first: Int, $last: Int) {\n    users(filter: $filter, sort: $sort, after: $after, before: $before, first: $first, last: $last) {\n      nodes {\n        id\n        email\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n      totalCount\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;