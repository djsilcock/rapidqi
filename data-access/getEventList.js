import getClient from "./apollo";
import gql from "graphql-tag";
export const eventListFull = gql`
  query EventList {
    eventList {
      id
      rev
      title
      people {
        proposers {
          id
          rev
          userName
          realName
          email
          category
          isAdmin
        }

        involved {
          id
          rev
          userName
          realName
          email
          category
          isAdmin
        }
      }
      eventDate
      triumphs
      challenges
      suggestions
      actionPoints {
        id
        rev
        title
        people {
          proposers {
            id
            rev
            userName
            realName
            email
            category
            isAdmin
          }
          involved {
            id
            rev
            userName
            realName
            email
            category
            isAdmin
          }
        }
        description
        dates {
          proposed
          start
          finish
        }
        methodology
        category {
          id
          name
        }
        lastUpdated
        lastUpdatedBy
        flags
      }
    }
  }
`;

export const eventListShort = gql`
  query EventList {
    eventList {
      id
      rev
      title
      people {
        proposers {
          id
          realName
          category
        }
        involved {
          id
          realName
          category
        }
      }
      eventDate
      triumphs
      challenges
      suggestions
      actionPoints {
        id
      }
    }
  }
`;
export function getEventList({ req, res, withAP, filter }) {
  const client = getClient({ req, res });
  return client.query({
    query: withAP ? eventListFull : eventListShort,
    variables: { filter }
  });
}
