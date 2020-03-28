import React from "react";
import Head from "next/head";
import taglist from "../data-access/taglist";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Table,
  Label,
  Modal,
  Header,
  Button,
  Menu,
  Icon
} from "semantic-ui-react";

//import { useQuery } from "../lib/apollo";
//import PROJECT_LIST from "../queries/projectlist.gql";
//import CURRENT_USER from "../queries/currentuser.gql";
import { useCurrentUser } from "../lib/signin";
import useSWR from "swr";

function generateLabels(doc, isAdmin) {
  const labels = doc.category.map(categoryTag => ({
    key: categoryTag,
    text: taglist[categoryTag],
    title: taglist[categoryTag],
    color: "grey"
  }));

  doc.flags.forEach(f => {
    const ADMIN_ONLY = [
      "needsVetting",
      "maybeCaldicott",
      "maybeResearch",
      "hidden"
    ];
    if (ADMIN_ONLY.includes(f) && !isAdmin) return;

    const labeldefs = {
      //[label text, mouseover text, colour]
      needsVetting: ["To vet", "Awaiting moderation", "red"],
      needsLead: ["Need leader", "Does not yet have a leader", "red"],
      isRecruiting: ["Recruiting", "Looking for participants", "grey"],
      isCompleted: ["Completed", "Completed", "grey"],
      hasCaldicott: ["IG", "Information Governance approved", "green"],
      hasResearch: ["R+D", "R+D approved", "green"],
      maybeCaldicott: ["IG", "May need Caldicott", "red"],
      maybeResearch: ["R+D", "May need R+D", "red"],
      pendingCaldicott: ["IG", "IG pending", "orange"],
      pendingResearch: ["R+D", "R+D approval pending", "orange"],
      notCaldicott: [
        "IG",
        "Information Governance approval not required",
        "grey"
      ],
      notResearch: ["R+D", "R+D approval not required", "grey", true],
      criticalIncident: ["CI", "relates to a previous incident or M+M", "blue"],
      hidden: ["Hidden", "Hidden from non-admins", "grey"]
    };
    if (labeldefs[f]) {
      labels.push({
        key: f,
        text: labeldefs[f][0],
        title: labeldefs[f][1],
        color: labeldefs[f][2]
      });
    }
  });

  const rowcolor = labels.some(lab => lab.color == "red")
    ? "red"
    : labels.some(lab => lab.color == "orange")
    ? "orange"
    : labels.some(lab => lab.color == "yellow")
    ? "yellow"
    : labels.some(lab => lab.color == "blue")
    ? "blue"
    : undefined;
  return [labels, rowcolor];
}

function DatabaseRow({ doc }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  if (doc === null)
    return (
      <Table.Row key={doc.id}>
        <Table.Cell>
          <Header>Loading...</Header>
          <span>
            <Label>Please wait...</Label>{" "}
          </span>
        </Table.Cell>
      </Table.Row>
    );
  const { title, description, people } = doc;

  const handleHide = () => {
    setModalOpen(false);
  };
  const currentuser = useCurrentUser();
  const isAdmin = currentuser.isAdmin;
  function makehref(user) {
    return (
      <Link key={user.uid} href={"/message/" + user.uid}>
        {user.realname}
        {user.role === "lead" ? "(lead)" : ""}
      </Link>
    );
  }
  var iAmLeader = people.leaders.find(i => i.id == currentuser.id) || isAdmin;
  var iAmInvolved =
    iAmLeader || people.involved.find(i => i.id == currentuser.id);
  const status = { info: 1, warning: 2, danger: 3 };
  var [labels, rowstatus] = generateLabels(doc, isAdmin);
  const projectComplete = false;
  const buttons = [];
  if (!iAmInvolved && !projectComplete)
    buttons.push({
      pathname: "/enquire",
      icon: "question-circle",
      text: "Enquire about this"
    });
  if (iAmLeader && !projectComplete) {
    buttons.push({ pathname: "/edit", icon: "pencil", text: "Edit proposal" });
    buttons.push({
      pathname: "/addoutcome",
      icon: "pencil",
      text: "Add outcome information"
    });
  } else {
    buttons.push({ pathname: "/view", icon: "info", text: "View proposal" });
    if (doc.outcome)
      buttons.push({
        pathname: "/viewoutcome",
        icon: "info",
        text: "View outcome information"
      });
  }

  const lead = people.leaders.length > 1 ? "leads" : "lead";
  return (
    <Table.Row
      color={rowstatus}
      id={doc.id}
      onClick={e => {
        setModalOpen(true);
        e.stopPropagation();
      }}
    >
      <Table.Cell>
        <Header>{title}</Header>
        <span>
          {labels.map((r, i) => (
            <span key={i} title={r.title}>
              <Label color={r.color}>{r.text}</Label>{" "}
            </span>
          ))}
        </span>
        <Modal open={modalOpen} onClose={handleHide}>
          <Modal.Header>{title}</Modal.Header>
          <Modal.Content>
            {description}
            <hr />
            <b>Proposed by: </b>
            {people.proposers.map(i => i.realName).join(",")}
            <br />
            <b>Project {lead}: </b>
            {people.leaders.map(i => i.realName).join(",") ?? "(No leader yet)"}
            <br />
            {people.involved.length > 0 ? (
              <span>
                <b>Others involved: </b>
                {people.involved.map(i => i.realName).join(",")}
              </span>
            ) : null}
            <hr />
            <Modal.Actions>
              {buttons.map((b, i) => (
                <Link
                  key={i}
                  href={{ pathname: b.pathname, query: { doc: doc.id } }}
                >
                  <Button>
                    <Icon name={b.icon} />
                    {b.text}
                  </Button>
                </Link>
              ))}

              <Button
                onClick={e => {
                  setModalOpen(false);
                  e.stopPropagation();
                }}
              >
                <Icon name="close" />
                Close
              </Button>
            </Modal.Actions>
          </Modal.Content>
        </Modal>
      </Table.Cell>
    </Table.Row>
  );
}

export function getServerSideProps() {
  return { props: { data: [] } };
}
function DatabaseTable(props) {
  const [statusfilter, setstatusfilter] = React.useState("all");
  const docsresults = useSWR(`/api/rest/event/all?filter=${statusfilter}`, {
    initialData: props.data
  });
  const router = useRouter();
  console.log(docsresults);
  if (docsresults.isValidating) return "Waiting for database";
  if (docsresults.error) return `Error getting documents: ${docsresults.error}`;

  const currentuser = useCurrentUser();
  const isAdmin = !!currentuser?.isAdmin;

  var listitems = docsresults.data.map(doc => {
    return (
      <DatabaseRow
        doc={doc}
        visible={router.query.doc === doc.id}
        key={doc.id}
      />
    );
  });
  const table =
    listitems.length === 0 ? (
      <p>Sorry, nothing to show here</p>
    ) : (
      <Table celled selectable id="accordion-example">
        <Table.Body>{listitems}</Table.Body>
      </Table>
    );
  return (
    <div className="App">
      <Head>
        <title>People Make QI</title>
      </Head>

      <Menu tabular>
        <Menu.Item
          active={statusfilter === "all"}
          onClick={() => setstatusfilter("all")}
        >
          All
        </Menu.Item>
        <Menu.Item
          active={statusfilter === "needsLead"}
          onClick={() => setstatusfilter("needsLead")}
        >
          Needs lead
        </Menu.Item>
        <Menu.Item
          active={statusfilter === "isRecruiting"}
          onClick={() => setstatusfilter("isRecruiting")}
        >
          Looking for collaborators
        </Menu.Item>
        <Menu.Item
          active={statusfilter === "recentlyUpdated"}
          onClick={() => setstatusfilter("recentlyUpdated")}
        >
          Recently Updated
        </Menu.Item>
        <Menu.Item
          active={statusfilter === "isCompleted"}
          onClick={() => setstatusfilter("isCompleted")}
        >
          Completed
        </Menu.Item>
      </Menu>

      {table}
    </div>
  );
}

export default DatabaseTable;
