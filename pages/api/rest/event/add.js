import addProject from '../../../../data-access/queries/addEvent.gql'
import getClient from '../../../../data-access/apollo'

export default async function AddEvent({ req, res }) {
  const client = getClient({ req, res })
  
  if (req.method == 'POST') {
    const project = req.body
    try {
      const result = await client.mutate({ mutation: addEvent, variables: { project })
      res.status(200).json(result)
    } catch (e) {
      res.status(400).end(JSON.stringify(e))
    }
  }
}
