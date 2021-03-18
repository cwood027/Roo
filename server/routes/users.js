const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');
const upload = require('../middleware/multer')();
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {
    User,
    schema,
    updateSchema,
    getIdFromToken,
} = require('../models/user');

router.get('/img', (req, res) => {
    User.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('imagesPage', { items: items });
        }
    });
});

router.post('/', upload.single('image'), (req, res, next) => {
    const obj = {
        img: {
            data: fs.readFileSync(
                path.join(__dirname + '/uploads/' + req.file.filename)
            ),
            contentType: 'image/png',
        },
    };
    User.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();
            res.redirect('/');
        }
    });
});

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    //Create a user with properties: name, email, password
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(
        _.pick(user, ['_id', 'name', 'email'])
    );
});

router.delete('/', auth, async (req, res) => {
    //Delete a user with the given id
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndRemove(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.send(user);
});

router.get('/:id', validateObjectId, async (req, res) => {
    //Returns the user with the given id
    const user = await User.findById(req.params.id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.send(user);
});

router.put('/updateEmail', auth, async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(
        id,
        { email: req.body.email },
        {
            new: true,
        }
    );

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.send(user);
});

router.put('/updateName', auth, async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(
        id,
        { name: req.body.name },
        {
            new: true,
        }
    );

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.send(user);
});

router.put('/updatePassword', auth, async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(req.body.password, salt);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(
        id,
        { password: newPassword },
        {
            new: true,
        }
    );

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.send(user);
});

module.exports = router;
