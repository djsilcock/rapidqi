import getCurrentUser from "../../../../data-access/getCurrentUser";

export default async function CurrentUser(req, res) {  
  if (req.method == "GET") {
    try {
      const result = await getCurrentUser({req,res})
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
