const db = require("../db/dbConfig.js");
const { getSignedUrlFromS3 } = require('../aws/s3.commands.js');

const getForums = async (page = 1) => {
  try {
    const offset = (page - 1) * 20;
    let posts = await db.any(
      `
      SELECT forums_posts.post_id, forums_posts.post, users.username, users.user_id, users.profile_picture
      FROM forums_posts
      JOIN users ON forums_posts.user_id = users.user_id
      ORDER BY forums_posts.post_id DESC
      OFFSET $1 LIMIT 21
      `,
      offset
    );
    if(!posts.length) return { posts, more_posts: false };
    const more_posts = posts.length > 20;
    if (more_posts) forums.pop();
    posts = await Promise.all(
      posts.map(async (post) => {
        if (post.profile_picture) {
          const signedUrl = await getSignedUrlFromS3(post.profile_picture);
          post.profile_picture = signedUrl;
        }
        return post;
      })
    );
    return { posts, more_posts };
  } catch (error) {
    throw error;
  }
};

const getForumById = async (postId) => {
  try {
    const post = await db.one(
      `
      SELECT forums_posts.post_id, forums_posts.post, users.username, users.user_id, users.profile_picture
      FROM forums_posts
      JOIN users ON forums_posts.user_id = users.user_id
      WHERE forums_posts.post_id = $1
      `,
      postId
    );
    if (post.profile_picture) {
      const signedUrl = await getSignedUrlFromS3(post.profile_picture);
      post.profile_picture = signedUrl;
    }
    return post;
  } catch (error) {
    throw error;
  }
};

const getDirectResponses = async (postId, page = 1) => {
  try {
    const offset = (page - 1) * 10;
    let responses = await db.any(
      `
      SELECT forums_responses.response_id, forums_responses.post_id, forums_responses.response, users.username, users.user_id, users.profile_picture
      FROM forums_responses
      JOIN users ON forums_responses.user_id = users.user_id
      WHERE forums_responses.post_id = $1 AND forums_responses.parent_response_id IS NULL
      ORDER BY forums_responses.response_id DESC
      LIMIT 11 OFFSET $2
      `,
      [postId, offset]
    );
    if (!responses.length) return { responses, more_responses: false };
    const more_responses = responses.length > 10;
    if (more_responses) responses.pop();
    responses = await Promise.all(
      responses.map(async (response) => {
        if (response.profile_picture) {
          const signedUrl = await getSignedUrlFromS3(response.profile_picture);
          response.profile_picture = signedUrl;
        }
        return response;
      })
    );
    responses = responses.sort((a, b) => a.response_id - b.response_id);
    return { responses, more_responses };
  } catch (error) {
    throw error;
  }
};

const getResponseById = async (responseId) => {
  try {
    const response = await db.one(
      `
      SELECT forums_responses.response_id, forums_responses.post_id, forums_responses.response, users.username, users.user_id, users.profile_picture
      FROM forums_responses
      JOIN users ON forums_responses.user_id = users.user_id
      WHERE forums_responses.response_id = $1
      `,
      responseId
    );
    if (response.profile_picture) {
      const signedUrl = await getSignedUrlFromS3(response.profile_picture);
      response.profile_picture = signedUrl;
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const getResponses = async (responseId, page = 1) => {
  try {
    const offset = (page - 1) * 10;
    let responses = await db.any(
      `
      SELECT forums_responses.response_id, forums_responses.post_id, forums_responses.response, users.username, users.user_id, users.profile_picture
      FROM forums_responses
      JOIN users ON forums_responses.user_id = users.user_id
      WHERE forums_responses.parent_response_id = $1
      ORDER BY forums_responses.response_id DESC
      LIMIT 11 OFFSET $2
      `,
      [responseId, offset]
    );
    if (!responses.length) return { responses, more_responses: false };
    const more_responses = responses.length > 10;
    if (more_responses) responses.pop();
    responses = await Promise.all(
      responses.map(async (response) => {
        if (response.profile_picture) {
          const signedUrl = await getSignedUrlFromS3(response.profile_picture);
          response.profile_picture = signedUrl;
        }
        return response;
      })
    );
    responses = responses.sort((a, b) => a.response_id - b.response_id);
    return { responses, more_responses };
  } catch (error) {
    throw error;
  }
};

const createForum = async (post, user_id) => {
  try {
    let newPost = await db.one(
      `
      INSERT INTO forums_posts (post, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [post, user_id]
    );
    newPost = await getForumById(newPost.post_id); 
    return newPost;
  } catch (error) {
    throw error;
  }
};

const createResponse = async (response_body, user_id) => {
  try {
    const { post_id, parent_response_id, response } = response_body;
    const newResponse = await db.one(
      `
      INSERT INTO forums_responses (post_id, parent_response_id, response, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [post_id, parent_response_id, response, user_id]
    );
    const user = await db.one(
      `
      SELECT username, profile_picture, user_id
      FROM users
      WHERE user_id = $1
      `,
      user_id
    );
    if (user.profile_picture) {
      const signedUrl = await getSignedUrlFromS3(user.profile_picture);
      user.profile_picture = signedUrl;
    }
    return { ...newResponse, ...user };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getForums,
  getForumById,
  getDirectResponses,
  getResponseById,
  getResponses,
  createForum,
  createResponse,
};
