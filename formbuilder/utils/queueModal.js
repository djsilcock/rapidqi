export function queueModal({ context, name, vars, status }) {
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
    context.setStatus(
      Object.assign({}, context.status, {
        modalQueue: modalQueue.concat([{ name, vars, status, onSubmit }])
      })
    );
  });
  return modalPromise;
}
