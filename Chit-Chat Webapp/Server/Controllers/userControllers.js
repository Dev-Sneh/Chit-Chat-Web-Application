import asyncHandler from "express-async-handler";
import User from "../Models/userModel.js";
import generateToken from "../config/generateToken.js";
import Chat from "../Models/chatModel.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    req.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Unable to create User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const allUser = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword, { password: 0 }).find({
    _id: { $ne: req.user._id },
  });
  res.send(users);
});

const storeNotification = asyncHandler(async (req, res) => {
  const { userId, messageId, chatId } = req.body;

  const stored = await User.findByIdAndUpdate(
    userId,
    {
      $push: { notifications: { chatId: chatId, message: messageId } },
    },
    { new: true },
  )
  res.sendStatus(204);

  if (!stored) {
    res.status(400);
    throw new Error("Notification cannot be stored");
  }

})

const getNotifications = asyncHandler(async (req, res) => {
  const { id } = req.params;

  var notifications = await User.findById(
    id,
  )
    .populate("notifications.message", 'sender content chat')
    .select("notifications");

  notifications = await User.populate(notifications, {
    path: 'notifications',
    populate: {
      path: 'message.chat',
      populate: {
        path: 'users',
        select: 'name',
        model: User
      },
      select: "chatName isGroupChat users",
      model: Chat
    }
  }
  )

  res.status(200).send(notifications);
})

const removeNotification = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  var removed = await User.findByIdAndUpdate(
    userId,
    { $pull: { notifications: { chatId: chatId } } },
    { new: true },
  )
    .select("notifications")
    .populate("notifications.message", 'sender content chat')

  removed = await User.populate(removed, {
    path: 'notifications',
    populate: {
      path: 'message.chat',
      populate: {
        path: 'users',
        select: 'name',
        model: User
      },
      select: "chatName isGroupChat users",
      model: Chat
    }
  })

  res.status(200).json(removed);

  if (!removed) {
    res.status(400);
    throw new Error("Notification cannot be Removed");
  }

})

export { registerUser, authUser, allUser, storeNotification, getNotifications, removeNotification };
