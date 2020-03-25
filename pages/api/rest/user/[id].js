import getUser from "../../../../data-access/getUser";

export default async function GetUser({ req, res }) {
  const id = req.query.id;
  if (req.method == "GET") {
    try {
      const result=await getUser({req,res,id})
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
