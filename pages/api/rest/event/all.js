import projectList from "../../../../data-access/queries/eventlist.gql";
import getClient from "../../../../data-access/apollo";

export default async function ProjectList({ req, res }) {
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
        query: projectList,
        variables: { filter }
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
