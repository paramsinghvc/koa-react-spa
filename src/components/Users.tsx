/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useCallback, useState } from "react";
import UserService from "../shared/user.service";
import styled from "@emotion/styled";

const Holder = styled.main`
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserItem = styled.section`
  border: 2px solid grey;
  border-radius: 3px;
  max-width: 60vw;
  min-width: 40vw;
  overflow: hidden;
  padding: 20px;
  margin-bottom: 20px;
  display: grid;
  justify-content: start;
  grid-template-areas:
    "i t"
    "i x"
    "i ."
    "i .";
  grid-column-gap: 20px;
  > img {
    grid-area: i;
  }
  > p {
    grid-area: x;
    justify-self: start;
    margin-top: 0;
    &:first-of-type {
      grid-area: t;
    }
  }
`;

const Users: FC<{}> = () => {
  const [users, setUsers] = useState([]);

  const fetchAllUsers = useCallback(async () => {
    const { response, error } = await UserService.getUsers();
    response && setUsers(response.data);
  }, [setUsers]);

  const postLogin = useCallback(async () => {
    await UserService.postLogin({
      email: "eve.holt@reqres.in",
      password: "cityslicka"
    });
  }, []);

  useEffect(() => {
    fetchAllUsers();
    postLogin();
  }, []);

  return (
    <Holder>
      {users.map(({ id, email, first_name, last_name, avatar }: any) => (
        // <p key={user.id}>{JSON.stringify(user)}</p>
        <UserItem key={id}>
          <img src={avatar} />
          <p>
            {first_name} {last_name}
          </p>
          <p>{email}</p>
        </UserItem>
      ))}
    </Holder>
  );
};

export default Users;
