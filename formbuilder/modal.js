/*eslint-disable react/prop-types*/
import React from "react";
import { Modal } from "semantic-ui-react";
import { useFormikContext } from "formik";
//import PropTypes from "prop-types";
export { queueModal } from "./utils/queueModal";
import { InnerFormContainer } from "./innerform";

function queueModal({ context, name, vars, status }) {
  const modalQueue = context.status.modalQueue;
  const modalPromise = new Promise((res, rej) => {
    const onSubmit = val => {
      context.setStatus(
        Object.assign({}, context.status, {
          modalQueue: context.status.modalQueue.slice(1)
        })
      );
      val ? res(val) : rej(val);
    };
    context.setStatus({
      modalQueue: modalQueue.concat([{ name, vars, status, onSubmit }]),
      ...context.status
    });
  });
  return modalPromise;
}

export function ModalComponent({ name, compiledformdef }) {
  const formik = useFormikContext();
  const currentModal = formik.status.modalQueue[0];
  if (currentModal?.name !== name) return null;
  const { vars, onSubmit, status } = currentModal;
  status.parent = formik;
  const closeModal = value => {
    return Promise.resolve(onSubmit(value));
  };
  return (
    <Modal open={true}>
      <InnerFormContainer
        formname={"modal" + name}
        onSubmit={v => {
          closeModal(v);
        }}
        onCancel={() => {
          closeModal();
        }}
        initialValues={vars}
        initialStatus={status}
        formdef={compiledformdef}
        enableReinitialize
      />
    </Modal>
  );
}
ModalComponent.isInvisible = true;
ModalComponent.listeners = { queueModal };
