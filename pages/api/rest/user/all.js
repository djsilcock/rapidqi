import getAllUsers from "../../../../data-access/getAllUsers";

export default async function UserList({ req, res }) {
  const filter =
    typeof req.query.filter == "undefined"
      ? undefined
      : Array.isArray(req.query.filter)
      ? req.query.filter
      : [req.query.filter];

  if (req.method == "GET") {
    try {
      const result = await getAllUsers({filter,req,res})
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
