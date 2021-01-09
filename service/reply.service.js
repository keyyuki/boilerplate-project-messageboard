const { firestore } = require('firebase-admin');
const crypto = require('crypto');

const THREAD_COLLECTION = 'thread';
const REPLY_COLLECTION = 'reply';
function hashPassword (password) { return crypto.createHash('md5').update('&*%' + password).digest("hex"); }
function addReply (threadId, text, deletePassword)
{
  firestore().collection(THREAD_COLLECTION).doc(threadId).collection(REPLY_COLLECTION).add({
    text: text,
    delete_password: hashPassword(deletePassword),
    created_on: Date.now(),
    reported: false
  });
}
const deleteReply = async (threadId, replyId, password) =>
{

  const doc = await firestore().collection(THREAD_COLLECTION).doc(threadId).collection(REPLY_COLLECTION).doc(replyId).get();

  if (!doc.exists) {
    throw 'doc not found';
  }
  const hashedPassword = hashPassword(password);
  if (doc.data().delete_password != hashedPassword) {
    console.log(doc.data().delete_password, hashedPassword);
    throw 'invalid password';
  }
  doc.ref.delete();
};

const reportReply = async (threadId, replyId) =>
{
  const doc = await firestore().collection(THREAD_COLLECTION).doc(threadId).collection(REPLY_COLLECTION).doc(replyId).get();

  if (!doc.exists) {
    throw 'doc not found';
  }

  await doc.ref.update({ reported: true });
};
module.exports = {
  addReply, deleteReply, reportReply
};
