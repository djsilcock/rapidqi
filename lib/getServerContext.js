export function getServerContext({ req, res }) {
  return { req, res };
}
export function getDBContext(ctx) {
  return {};
}
export function getAuthContext(ctx) {
  return {};
}
export function getContext(ctx) {
  return Object.assign({}, getServerContext(ctx), getDBContext(ctx), getAuthContext(ctx));
}
