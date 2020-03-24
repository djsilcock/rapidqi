import getProject from "../../../../data-access/queries/getEvent.gql";
import getClient from "../../../../data-access/apollo";

export default async function GetEvent({ req, res }) {
  const client = getClient({ req, res });
  const id = req.query.id;
  if (req.method == "GET") {
    try {
      const result = await client.query({
        query: getProject,
        variables: { id }
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
