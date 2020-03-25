import React from "react";
import { useCurrentUser, signout } from "../lib/signin";
import Link from "next/link";
import { Menu, Icon } from "semantic-ui-react";

function TopNav(props) {
  const user = useCurrentUser();
  const isAdmin = user?.isAdmin
  const loginbutton =
    !user || user.isAnonymous ? (
      <Link href="/signin" passHref>
        <Menu.Item>
          Login
          <Icon name="sign-in" />
        </Menu.Item>
      </Link>
    ) : (
      <Menu.Item
        onClick={() => {
          signout();
        }}
      >
        <span>
          <Icon name="sign-out" />
          Logout {user.realName} {isAdmin ? "(admin)" : ""}
        </span>
      </Menu.Item>
    );
  return (
    <Menu stackable inverted>
      <Link href="/" passHref>
        <Menu.Item header>UHM Rapid Reviews</Menu.Item>
      </Link>
      <Link href="/addevent">
        <Menu.Item>
          <Icon name="thumbs up" />
          New event
        </Menu.Item>
      </Link>

      <Link href="/events" passHref>
        <Menu.Item>
          <Icon name="list" />
          All events
        </Menu.Item>
      </Link>
      <Link href="/actions" passHref>
        <Menu.Item>
          <Icon name="list" />
          Action points
        </Menu.Item>
      </Link>
      {loginbutton}
    </Menu>
  );
}

export default TopNav;
