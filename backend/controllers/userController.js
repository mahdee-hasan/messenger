const cloudinary = require("../cloudinaryConfig");
const people = require("../models/people");
const post = require("../models/post");

const setCover = async (req, res, next) => {
  try {
    const coverObject = {
      src: req.coverName,
      public_id: req.public_id,
    };
    const prev = await people.findById(req.user.userId);
    if (prev?.cover?.[0]?.public_key) {
      const cloudRes = await cloudinary.uploader.destroy(
        prev.cover[0].public_id
      );

      if (!cloudRes || cloudRes.result !== "ok") {
        throw new Error("Error deleting previous cover from Cloudinary");
      }
    }
    const user = await people.findByIdAndUpdate(
      req.user.userId,
      { cover: [coverObject] },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ Error: error.message });
  }
};
const setAvatar = async (req, res, next) => {
  try {
    const prev = await people.findById(req.user.userId);
    if (prev?.avatar) {
      const cloudRes = await cloudinary.uploader.destroy(prev.public_id);

      if (!cloudRes || cloudRes.result !== "ok") {
        throw new Error("Error deleting previous cover from Cloudinary");
      }
    }
    await post.updateMany(
      { "author.id": req.user.userId },
      { $set: { "author.avatar": req.avatarName } }
    );
    const user = await people.findByIdAndUpdate(
      req.user.userId,
      { avatar: req.avatarName, public_id: req.public_id },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ Error: error.message });
  }
};
const getPost = async (req, res, next) => {
  try {
    const posts = await post
      .find({ "author.id": req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
module.exports = {
  setCover,
  setAvatar,
  getPost,
};
