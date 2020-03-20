/*eslint-env jest */
import IndexPage from "../../pages/index";
import { BareApp } from "../../pages/_app";
import React from "react";
import {
  render,
  waitForDomChange,
  waitForElementToBeRemoved,
  act
} from "@testing-library/react";
import { makeClient } from "../client";
import { makedatabase } from "../database";
import { useRouter } from "next/router";
const client = async () => {
  const database = await makedatabase();
  return database
    .allDocs({ startkey: "user ", endkey: "user!", limit: 1 })
    .then(r => {
      const someuserid = r.rows[0].id;
      return makeClient({
        database,
        currentuser: { id: someuserid, isAdmin: false }
      });
    });
};
jest.mock("next/router");
useRouter.mockImplementation(() => ({ query: {} }));
describe("Index page", () => {
  test("should display without crashing", async () => {
    const { container, queryAllByText } = render(
      <BareApp apollo={await client()} Component={IndexPage} />
    );

    await act(() =>
      waitForElementToBeRemoved(() => queryAllByText(/Waiting for/))
    );
    expect(queryAllByText(/Error/)).toHaveLength(0);
    expect(container).toMatchSnapshot();
  });
});
