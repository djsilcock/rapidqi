import allUsers from "../../../../data-access/queries/allUsers.gql";
import getClient from "../../../../data-access/apollo";

export default async function UserList({ req, res }) {
  const client = getClient({ req, res });
  const filter =
    typeof req.query.filter == "undefined"
      ? undefined
      : Array.isArray(req.query.filter)
      ? req.query.filter
      : [req.query.filter];

  if (req.method == "GET") {
    try {
      const result = await client.query({
        query: allUsers,
        variables: { filter }
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
