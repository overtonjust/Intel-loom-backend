const express = require("express");
const forums = express.Router();
const { camelizeKeys, decamelizeKeys } = require("humps");
const { authenticateUser } = require("../auth/users.auth.js");
const {
  getForums,
  getForumById,
  getDirectResponses,
  getResponseById,
  getResponses,
  createForum,
  createResponse,
} = require("../queries/forums.queries.js");

/* forums.use(authenticateUser); */

forums.get("/", async (req, res) => {
  try {
    const posts = await getForums();
    res.json(camelizeKeys(posts));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.get("/forum-info/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await getForumById(postId);
    res.json(camelizeKeys(post));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.get("/post-responses/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const responses = await getDirectResponses(postId);
    res.json(camelizeKeys(responses));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.get("/response-info/:responseId", async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await getResponseById(responseId);
    res.json(camelizeKeys(response));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.get("/response-responses/:responseId", async (req, res) => {
  try {
    const { responseId } = req.params;
    const responses = await getResponses(responseId);
    res.json(camelizeKeys(responses));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.post("/", async (req, res) => {
  try {
    const { post } = req.body;
    const { userId } = req.session;
    const newPost = await createForum(post, userId);
    res.status(201).json(camelizeKeys(newPost));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

forums.post("/response", async (req, res) => {
  try {
    const { userId } = req.session;
    const newResponse = await createResponse(decamelizeKeys(req.body), userId);
    res.status(201).json(camelizeKeys(newResponse));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = forums;
