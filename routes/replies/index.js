const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const ThreadService = require('../../service/thread.service');
const ReplyService = require('../../service/reply.service');

const route = Router();
route.post('/:board', [
  param('board').not().isEmpty()
    .trim()
    .escape().toLowerCase(),
  body('thread_id').not().isEmpty()
    .trim()
    .escape(),
  body('text').not().isEmpty()
    .trim()
    .escape(),
  body('delete_password').not().isEmpty()
    .trim()
    .escape()
], async (req, res) =>
{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).send("invalid params." + errors.formatWith((message) => message.msg));
  }

  ReplyService.addReply(req.body.thread_id, req.body.text, req.body.delete_password);
  ThreadService.bumpedThread(req.body.thread_id);

  return res.redirect('/b/' + req.params.board + '?thread_id=' + req.body.thread_id);
});

route.get('/:board', [
  param('board').not().isEmpty()
    .trim()
    .escape().toLowerCase(),
  query('thread_id').not().isEmpty()
    .trim()
    .escape(),

], async (req, res) =>
{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(404).send("Board not found." );
  }
  console.log(req.params);
  const result = await ThreadService.findByThread(req.query.thread_id);

  return res.json(result);
});

route.delete("/:board", [
  param('board').not().isEmpty()
    .trim()
    .toLowerCase(),
  body('thread_id').notEmpty().trim(),
  body('reply_id').notEmpty().trim(),
  body('delete_password').notEmpty().trim(),
], async (req, res) =>
{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).send("Invalid params");
  }
  try {
    await ReplyService.deleteReply(req.body.thread_id, req.body.reply_id, req.body.delete_password);
    return res.send("success");
  } catch (error) {
    console.log(error);
    return res.send("incorrect password");
  }
});

route.put("/:board", [
  param('board').not().isEmpty()
      .trim()
      .toLowerCase(),
      body('thread_id').notEmpty().trim(),
      body('reply_id').notEmpty().trim(),
], async (req, res) =>
{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(404).send("Invalid params");
  }
  try {
      await ReplyService.reportReply(req.body.thread_id, req.body.reply_id);
      return res.send("success");
  } catch (error) {
      console.log(error)
      return res.send("change reported fail");
  }
});
module.exports = route;
