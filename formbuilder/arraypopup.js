/*eslint-disable react/prop-types*/
import React from "react";
import { Button } from "semantic-ui-react";
import { useFormikContext, FieldArray, useField } from "formik";
import { queueModal } from "./utils/queueModal";
export function ArrayPopupComponent({
  validate,
  name,
  summary,
  addButton,
  modalForm,
  initVars = () => ({}),
  initStatus = () => ({})
}) {
  const [field] = useField({ name, type: "select", validate });
  const formik = useFormikContext();
  // end hooks
  return (
    <FieldArray name={name}>
      {arrayhelpers => (
        <>
          {field.value.map((subfield, index) =>
            summary({
              value: subfield,
              remove: () => arrayhelpers.remove(index),
              popup: async () => {
                const values = await queueModal(formik, {
                  name: modalForm,
                  vars: subfield,
                  status: initStatus(formik)
                });
                arrayhelpers.replace(index, values);
              }
            })
          )}
          {addButton ? (
            <div>
              <Button
                icon="add"
                type="button"
                as="a"
                onClick={evt => {
                  evt.preventDefault();
                  formik.status
                    .dispatch({
                      type: "queueModal",
                      name: modalForm,
                      vars: initVars(formik),
                      status: initStatus(formik)
                    })
                    .then(result => {
                      arrayhelpers.push(result[0]);
                    })
                    .catch(() => {
                      return;
                    });
                }}
              />
            </div>
          ) : null}
        </>
      )}
    </FieldArray>
  );
}
