import { getEventList } from "../../../../data-access/getEventList";

export default async function EventList(req, res) {
  const filter =
    typeof req.query.filter == "undefined"
      ? undefined
      : Array.isArray(req.query.filter)
      ? req.query.filter
      : [req.query.filter];
  const withAP = !!req.query.detail;
  if (req.method == "GET") {
    try {
      const result = await getEventList({ req, res, withAP, filter });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).end(JSON.stringify(e));
    }
  }
}
