const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const ThreadService = require('../../service/thread.service');

const route = Router();

route.post('/:board', [
    param('board').not().isEmpty()
        .trim()
        .escape().toLowerCase(),
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
 
    await ThreadService.addThread(req.body.text, req.params.board, req.body.delete_password);

    res.status(302).redirect('/b/' + req.params.board + '/');
});


route.get('/:board', [
    param('board').not().isEmpty()
        .trim()
        .toLowerCase()],
    async (req, res) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).send("Board not found." + errors.formatWith((message) => message.msg).join('. '));
        }
        console.log(req.params);
        const result = await ThreadService.findByBoard(req.params.board);

        return res.json(result);
    });

route.delete("/:board", [
    param('board').not().isEmpty()
        .trim()
        .toLowerCase(),
    body('thread_id').notEmpty().trim(),
    body('delete_password').notEmpty().trim(),
], async (req, res) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).send("Invalid params");
    }
    try {
        await ThreadService.deleteThread(req.body.thread_id, req.body.delete_password);
        return res.send("success");
    } catch (error) {
        console.log(error)
        return res.send("incorrect password");
    }
});
route.put("/:board", [
    param('board').not().isEmpty()
        .trim()
        .toLowerCase(),
    body('report_id').notEmpty().trim(),
], async (req, res) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).send("Invalid params");
    }
    try {
        await ThreadService.reportThread(req.body.report_id);
        return res.send("success");
    } catch (error) {
        console.log(error)
        return res.send("change reported fail");
    }
});
module.exports = route;
