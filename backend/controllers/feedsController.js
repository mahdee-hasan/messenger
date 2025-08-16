const people = require(".././models/people");
const post = require(".././models/post");
const comment = require("../models/comment");
const getFeed = async (req, res, next) => {
  try {
    const posts = await post
      .find({ privacy: "public" })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const addPost = async (req, res, next) => {
  try {
    const user = await people.findById(req.user.userId);

    const author = {
      id: user._id,
      avatar: user.avatar,
      name: user.name,
    };
    const newPost = new post({
      text: req.body.text,
      images: req.uploadedFiles,
      author,
      privacy: req.body.privacy,
      isEnableComments: req.body.isEnableComments,
    });
    const data = await newPost.save();
    await people.findByIdAndUpdate(req.user.userId, {
      $inc: { "stats.posts": 1 },
    });

    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "server side error", error: error.message });
  }
};
const addLike = async (req, res, next) => {
  try {
    const selectedPost = await post.findByIdAndUpdate(req.query.postId, {
      $addToSet: { likes: req.user.userId },
    });
    res.status(200).json({ success: true, message: "liked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "error liking post" });
  }
};
const removeLike = async (req, res, next) => {
  try {
    await post.findByIdAndUpdate(req.query.postId, {
      $pull: { likes: req.user.userId },
    });

    res.status(200).json({ success: true, message: "unLiked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "error liking post" });
  }
};
const getSpecificPost = async (req, res, next) => {
  try {
    const specificPost = await post.findById(req.params.id);
    if (specificPost) {
      res.status(200).json(specificPost);
    } else {
      res.status(404).json({ error: "post not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "error finding post" });
  }
};
const getSpecificComments = async (req, res, next) => {
  try {
    const specificComments = await comment
      .find({ post_id: req.params.postId })
      .sort("createdAt");
    if (specificComments) {
      res.status(200).json(specificComments);
    } else {
      res.status(404).json({ error: "comment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "error finding comment" });
  }
};
const addComments = async (req, res, next) => {
  try {
    const user = await people.findById(req.user.userId, "avatar");
    const commentData = new comment({
      ...req.body,
      post_id: req.params.postId,
      author: {
        id: req.user.userId,
        name: req.user.username,
        avatar: user.avatar,
      },
    });
    const newComment = await commentData.save();

    await post.findByIdAndUpdate(req.params.postId, {
      $addToSet: { comments: newComment._id },
    });
    const comments = await comment
      .find({ post_id: req.params.postId })
      .sort("createdAt");
    res.status(200).json(comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
const updateComment = async (req, res, next) => {
  try {
    const selectedComment = await comment.findById(req.params.id);
    await comment.findByIdAndUpdate(req.params.id, {
      $set: {
        text: req.body.text,
        edited: true,
      },
      $addToSet: { old_text: selectedComment.text },
    });
    const allComments = await comment.find({
      post_id: selectedComment.post_id,
    });
    res.status(200).json(allComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const selectedComment = await comment.findById(req.params.id);

    if (selectedComment && selectedComment.isReply) {
      await comment.findByIdAndUpdate(selectedComment.isReply, {
        $pull: { replies: selectedComment._id },
      });
    } else if (selectedComment && selectedComment.replies.length > 0) {
      await Promise.all(
        selectedComment.replies.map((replyId) =>
          comment.findByIdAndDelete(replyId)
        )
      );
    } else if (!selectedComment) {
      res.status(404).json({ error: "comment not found" });
    }
    await post.findByIdAndUpdate(selectedComment.postId, {
      $pull: { comments: selectedComment._id },
    });
    await comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const replyComments = async (req, res, next) => {
  try {
    const user = await people.findById(req.user.userId, "avatar");
    const mainComment = await comment.findById(req.params.id);
    const commentData = new comment({
      ...req.body,
      post_id: req.query.postId,
      author: {
        id: req.user.userId,
        name: req.user.username,
        avatar: user.avatar,
      },
      isReply: mainComment._id,
    });
    const reply = await commentData.save();
    await comment.findByIdAndUpdate(req.params.id, {
      $addToSet: { replies: reply._id },
    });
    const comments = await comment
      .find({ post_id: req.query.postId })
      .sort("createdAt");
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addCommentLike = async (req, res, next) => {
  try {
    await comment.findByIdAndUpdate(req.query.commentId, {
      $addToSet: { likes: req.user.userId },
    });
    res.status(200).json({ success: true, message: "liked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "error liking comment" });
  }
};
const removeCommentLike = async (req, res, next) => {
  try {
    await comment.findByIdAndUpdate(req.query.commentId, {
      $pull: { likes: req.user.userId },
    });

    res.status(200).json({ success: true, message: "unLiked successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "error liking comment" });
  }
};
module.exports = {
  getFeed,
  addPost,
  addLike,
  removeLike,
  getSpecificPost,
  getSpecificComments,
  addComments,
  updateComment,
  deleteComment,
  replyComments,
  addCommentLike,
  removeCommentLike,
};
