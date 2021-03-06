const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
    isAdmin: {
        type: Boolean,
    },
});

userShema.methods.generateAuthToken = function () {
    return (jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin },
        config.get("jwtPrivateKey")
    ));
};

const User = mongoose.model("User", userShema);

const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().min(1).max(255).required().email(),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
        .required(),
});

exports.schema = schema;
exports.User = User;
