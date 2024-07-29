const mongoose = require("mongoose");
const Comment = require("./comment");
const User = require("./user");
const slugify = require("slugify");

const StorySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    slug: String,
    title: {
        type: String,
        required: [true, "Please provide a title"],
        unique: true,
        minlength: [4, "Please provide a title of at least 4 characters"],
    },
    content: {
        type: String,
        required: [true, "Please provide content"],
        minlength: [10, "Please provide content of at least 10 characters"],
    },
    image: {
        type: String,
        default: "default.jpg"
    },
    readtime: {
        type: Number,
        default: 3
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: "Comment"
    }],
    commentCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

StorySchema.pre("save", function (next) {
    if (!this.isModified("title")) {
        next();
    }
    this.slug = this.makeSlug();
    next();
});

StorySchema.pre("remove", async function (next) {
    // Remove comments associated with the story
    await Comment.deleteMany({ story: this._id });

    // Remove story reference from users' readList
    await User.updateMany(
        { readList: this._id },
        { $pull: { readList: this._id } }
    );

    next();
});

StorySchema.methods.makeSlug = function () {
    return slugify(this.title, {
        replacement: '-',
        remove: /[*+~.()'"!:@/?]/g,
        lower: true,
        strict: false,
        locale: 'tr',
        trim: true
    });
};

const Story = mongoose.model("Story", StorySchema);

module.exports = Story;
