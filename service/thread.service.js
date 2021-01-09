const { firestore } = require('firebase-admin');
const crypto = require('crypto');

function ThreadService ()
{
    const db = firestore().collection('thread');

    const hashPassword = (password) => crypto.createHash('md5').update('&*%' + password).digest("hex");

    const addThread = (text, board, deletePassword) =>
    {
        return db.add({
            board,
            text,
            delete_password: hashPassword(deletePassword),
            created_on: Date.now(),
            bumped_on: Date.now(),
            reported: false,
            replycount: 0
        });
    };

    const findByBoard = async (board) =>
    {
        const result = [];
        const threads = await db.where('board', '==', board).orderBy('bumped_on', 'desc').limit(10).get();
        if (threads.empty) {
            return [];
        }
        for (let i = 0; i < threads.docs.length; i++) {
            const thread = threads.docs[i];
            const replies = await db.doc(thread.id).collection('reply').orderBy('created_on', 'desc').limit(3).get();
            const {
                delete_password,
                reported,
                ...item
            } = {
                ...thread.data(),
                _id: thread.id,
                replies: replies.docs.map(doc =>
                {
                    return {
                        _id: doc.id,
                        ...doc.data()
                    };
                }).reverse()
            };

            result.push(item);
        }

        return result;
    };

    const findByBoardWithAllReplies = async (board) =>
    {
        const result = [];
        const threads = await db.where('board', '==', board).orderBy('bumped_on', 'desc').limit(10).get();
        if (threads.empty) {
            return [];
        }
        for (let i = 0; i < threads.docs.length; i++) {
            const thread = threads.docs[i];
            const replies = await db.doc(thread.id).collection('reply').orderBy('created_on', 'desc').get();
            const {
                delete_password,
                reported,
                ...item
            } = {
                ...thread.data(),
                _id: thread.id,
                replies: replies.docs.map(doc =>
                {
                    const { delete_password, ...replyData } = { ...doc.data };
                    return {
                        _id: doc.id,
                        ...replyData
                    };
                }).reverse()
            };

            result.push(item);
        }

        return result;
    };

    const findByThread = async (threadId) =>
    {
        const result = [];
        const thread = await db.doc(threadId).get();
        if (!thread.exists) {
            return null;
        }

        const replies = await thread.ref.collection('reply').orderBy('created_on', 'desc').get();
        console.log("-----", replies.docs.length)
        const {
            delete_password,
            reported,
            ...item
        } = {
            ...thread.data(),
            _id: thread.id,
            replies: replies.docs.map(doc =>
            {
                const { delete_password, ...replyData } = { ...doc.data() };
                return {
                    _id: doc.id,
                    ...replyData
                };
            }).reverse()
        };

        return item;

    };

    const deleteThread = async (threadId, password) =>
    {

        const doc = await db.doc(threadId).get();

        if (!doc.exists) {
            throw 'doc not found';
        }
        const hashedPassword = hashPassword(password);
        if (doc.data().delete_password != hashedPassword) {
            console.log(doc.data().delete_password, hashedPassword);
            throw 'invalid password';
        }
        db.doc(threadId).delete();
    };

    const reportThread = async (threadId) =>
    {
        const doc = await db.doc(threadId).get();

        if (!doc.exists) {
            throw 'doc not found';
        }

        await doc.ref.update({ reported: true });
    };

    const bumpedThread = (threadId) =>
    {
        db.doc(threadId).update({ bumped_on: Date.now() });
    };
    return {
        addThread,
        findByBoard,
        deleteThread,
        hashPassword,
        reportThread,
        bumpedThread,
        findByBoardWithAllReplies,
        findByThread
    };
}
module.exports = ThreadService();
