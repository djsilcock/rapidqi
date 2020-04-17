/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef } from "react";
import { Button } from "semantic-ui-react";
import FormContainer from "formbuilder";
import useSWR from "swr";
import { useRouter } from "next/router";

import taglist from "../data-access/taglist";
import * as Yup from "yup";

var addedPersonCount = 0;
function addPerson() {
  return async (item, ctx) => {
    try {
      const newitem = (
        await ctx.dispatch({
          type: "queueModal",
          name: "people_popup",
          vars: {
            realName: item,
            id: "NEW-" + addedPersonCount++,
            category: ""
          }
        })
      )[0];
      const targetContext = ctx.status.parent || ctx;
      targetContext.setFieldValue(
        "people.new",
        targetContext.values.people.new.concat([newitem])
      );
      return newitem.id;
    } catch {
      return;
    }
  };
}

const addUserForm = [
  {
    name: "realName",
    type: "text",
    label: "Full name",
    placeholder: "Name",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "id",
    type: "hidden",
    defaultvalue: ""
  },
  {
    name: "category",
    type: "radio",
    label: "Job role",
    options: Object.entries({
      MS: "Medical student",
      AA: "Anaesthesia Associate",
      NS: "Nurse",
      FY: "FY1/FY2",
      CT: "CT1-2",
      ACCS: "ACCS",
      Inter: "ST3-4",
      Higher: "ST5-7",
      SAS: "Staff grade",
      Con: "Consultant",
      Oth: "Other"
    }),
    validation: Yup.string().required(),
    defaultvalue: ""
  }
];

const addActionPointForm = [
  {
    name: "_",
    validation: Yup.object().shape({
      dates: Yup.object().shape({
        finish: Yup.date().min(
          Yup.ref("start"),
          "Finish date must be later than start date"
        )
      })
    })
  },
  {
    name: "title",
    type: "text",
    label: "Title",
    placeholder: "Action Point Title",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "dates.proposed",
    type: "datepicker",
    label: "Creation date:",
    required: true,
    validation: Yup.date().required(),
    defaultvalue: new Date().toISOString()
  },
  {
    name: "people_popup",
    type: "modal",
    formdef: addUserForm
  },

  {
    name: "people.new",
    type: "arraypopup",
    modalForm: "people_popup",
    label: "Register these people as users:",
    //eslint-disable-next-line react/display-name,react/prop-types
    summary: ({ popup, remove, value }) => {
      return (
        <div>
          {" "}
          <Button size="mini" icon="pencil" onClick={popup} />
          <Button size="mini" icon="user delete" onClick={remove} />
          {value}{" "}
        </div>
      );
    },
    defaultvalue: [],
    displayif: values => values.people?.new?.length > 0
  },
  {
    name: "description",
    type: "textarea",
    label: "Problem to be addressed",
    placeholder: "Enter description of project here",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },

  {
    name: "methodology",
    type: "textarea",
    label: "Planned improvement:",
    placeholder: "Brief description of planned improvement",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "category",
    type: "checkbox",
    options: Object.entries(taglist),
    label: "Tags",
    required: true,
    validation: Yup.array().required(),
    defaultvalue: []
  },

  {
    name: "people.involved",
    type: "typeahead",
    multiple: true,
    label: "People responsible",
    addItem: addPerson("involved"),
    search: true,
    allowNew: true,
    helptext: "Leave blank if you want somebody to volunteer",
    defaultvalue: []
  },
  {
    type: "datepicker",
    name: "nextUpdate",
    label: "Expected next update:",
    required: true,
    validation: Yup.date().required(),
    defaultvalue: ""
  },
  {
    type: "effect",
    effect: staffnamesEffect
  }
];

function staffnamesEffect(context) {
  const { data: usersquery } = useSWR("/api/rest/user/all", {
    initialdata: []
  });
  const staffnames = useMemo(() => {
    const mapfunc = s => ({
      key: s.id,
      value: s.id,
      text: s.realName,
      description: s.category
    });

    return []
      .concat(usersquery ?? [])
      .concat(context.values.people?.new ?? [])
      .concat(context.status.parent?.values.people?.new ?? [])
      .map(mapfunc);
  }, [
    usersquery,
    context.values.people?.new,
    context.status.parent?.values.people?.new
  ]);

  useEffect(() => {
    const options = context.status.options ?? {};
    options["people.proposers"] = staffnames;
    options["people.leaders"] = staffnames;
    options["people.involved"] = staffnames;
    const newstatus = {
      ...context.status,
      options
    };
    context.setStatus(newstatus);
  }, [staffnames]);
}
const addEventForm = [
  {
    name: "_",
    validation: Yup.object().shape({
      dates: Yup.object().shape({
        finish: Yup.date().min(
          Yup.ref("start"),
          "Finish date must be later than start date"
        )
      })
    })
    //validation: { "Finish date must be later than start date": (values) => (values.dates.start < values.dates.finish) }
  },
  {
    name: "id",
    type: "hidden",
    defaultvalue: ""
  },
  {
    name: "rev",
    type: "hidden",
    defaultvalue: ""
  },
  {
    name: "title",
    type: "text",
    label: "Event Title",
    placeholder: "Event Title",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "people_popup",
    type: "modal",
    formdef: addUserForm
  },
  {
    name: "actionpoint_popup",
    type: "modal",
    formdef: addActionPointForm
  },
  {
    name: "people.proposers",
    type: "typeahead",
    multiple: true,
    label: "Reported by",
    addItem: addPerson("proposers"),
    allowNew: true,
    required: true,
    search: true,
    validation: Yup.array()
      .required()
      .min(1),
    defaultvalue: []
  },
  {
    name: "eventDate",
    type: "datepicker",
    label: "Date of event",
    required: true,
    validation: Yup.date().required(),
    defaultvalue: ""
  },
  {
    name: "staffnameEffect",
    type: "effect",
    effect: staffnamesEffect
  },
  {
    name: "people.new",
    type: "arraypopup",
    modalForm: "people_popup",
    label: "Register these people as users:",
    //eslint-disable-next-line react/display-name,react/prop-types
    summary: ({ popup, remove, value }) => {
      return (
        <div>
          <Button size="mini" icon="pencil" onClick={popup} />
          <Button size="mini" icon="user delete" onClick={remove} />
          {`${value.realName}(${value.category})`}
        </div>
      );
    },
    defaultvalue: [],
    displayif: ({ values }) => values.people?.new?.length > 0
  },
  {
    name: "description",
    type: "textarea",
    label: "Description of the event",
    placeholder: "Enter description of project here",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "triumphs",
    type: "textarea",
    label: "What went well?",
    placeholder: "Triumphs",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "challenges",
    type: "textarea",
    label: "What could have gone better?",
    placeholder: "Challenges",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "suggestions",
    type: "textarea",
    label: "Suggestions for future events?",
    placeholder: "Suggestions",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "actionPoints",
    type: "arraypopup",
    modalForm: "actionpoint_popup",
    label: "Action Points:",
    addButton: true,
    controlFlow: async ({ ctx, index, value, popup }) => {
      const newnames = ctx.values.people.new;
      var newvalues = Object.assign({}, value);
      newvalues.people.new = newnames;
      newvalues = await popup(newvalues);
      ctx.setFieldValue("people.new", newvalues.people.new);
      newvalues.people.new = [];
      return newvalues;
    },
    //eslint-disable-next-line react/display-name,react/prop-types
    summary: ({ popup, remove, value }) => {
      return (
        <div>
          {" "}
          <Button size="mini" icon="pencil" onClick={popup} />
          <Button size="mini" icon="user delete" onClick={remove} />
          {value}{" "}
        </div>
      );
    },
    defaultvalue: []
  },

  {
    name: "category",
    type: "checkbox",
    options: Object.entries(taglist),
    label: "Areas covered",
    required: true,
    validation: Yup.array().required(),
    defaultvalue: []
  },
  {
    name: "othertags",
    type: "text",
    displayif: values => values?.category?.includes?.("other"),
    label: "Other areas covered",
    placeholder: "Other areas covered",
    required: true,
    validation: Yup.string().required(),
    defaultvalue: ""
  },
  {
    name: "people.new",
    type: "arraypopup",
    modalForm: "people_popup",
    label: "Register these people as users:",
    //eslint-disable-next-line react/display-name,react/prop-types
    summary: ({ popup, remove, value }) => {
      return (
        <div>
          <Button size="mini" icon="pencil" onClick={popup} />
          <Button size="mini" icon="user delete" onClick={remove} />
          {value}
        </div>
      );
    },
    defaultvalue: [],
    displayif: values => values.people?.new?.length > 0
  }
];

function ProjectInfoForm() {
  const router = useRouter();
  const isCompleted = useRef(false);

  useEffect(() => {
    if (isCompleted.current) router.push("/");
  });

  const formdef = addEventForm;
  const initialStatus = {};
  var initialvalues = undefined;

  const handleSubmit = async values => {
    const result = await fetch("/api/rest/event/add", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (result.ok) router.push("/");
  };
  const handleClose = () => {
    isCompleted.current = true;
  };
  return (
    <div>
      <h2>Event information</h2>
      <div>
        <FormContainer
          formname="addproject"
          onSubmit={handleSubmit}
          onCancel={handleClose}
          initialValues={initialvalues}
          initialStatus={initialStatus}
          formdef={formdef}
        />
      </div>
      <hr />
    </div>
  );
}
export default ProjectInfoForm;
