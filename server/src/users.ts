import Loki from "lokijs";

const db = new Loki("db.json");
var users = db.addCollection("users");

export function addOrUpdateUser({
  emailId,
  tokenInfo,
  session
}: {
  emailId: string;
  tokenInfo: string;
  session: string;
}) {
  const foundUser = users.findOne({ emailId });
  if (foundUser) {
    foundUser.token = tokenInfo;
    foundUser.session = session;
    users.update(foundUser);
    return;
  }
  users.insert({
    emailId,
    token: tokenInfo,
    session
  });
}

export function findUserWithSession(session: string) {
  return users.findOne({ session: session });
}
