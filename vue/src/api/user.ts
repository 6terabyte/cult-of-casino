'use strict';

import { request, gql } from 'graphql-request';
import { UserEntity } from '@/../../src/db/entities/user.entity';

import { NO_AUTH_GRAPHQL_URL } from '@/constants/constant';

export const addUser = async (args: {
  name: string;
  email: string;
  screenName: string;
  pass: string;
}): Promise<UserEntity | null> => {
  const query = gql`
    mutation {
      addUser(
        data:{
        name: "${args.name}"
        emailChangeTemp: "${args.email}"
        screenName: "${args.screenName}"
        hash: "${args.pass}"
      }){
        id
        name
        screenName
        email
        auth
        role
        chip
      }
    }
    `;
  const res = await (async () => {
    try {
      return ((await request(NO_AUTH_GRAPHQL_URL, query)) as any).addUser;
    } catch {
      return null;
    }
  })();
  return res;
};

export const getUserByAuth = async (args: {
  email: string;
  pass: string;
}): Promise<UserEntity | null> => {
  const query = gql`
    query {
      getUserByAuth(
        auth:{
        email: "${args.email}"
        hash: "${args.pass}"
      }){
        id
        name
        screenName
        email
        auth
        session
        role
        chip
      }
    }
    `;
  const res = await (async () => {
    try {
      return ((await request(NO_AUTH_GRAPHQL_URL, query)) as any).getUserByAuth;
    } catch {
      return null;
    }
  })();
  return res;
};
