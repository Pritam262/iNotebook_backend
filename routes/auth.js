// const express = require("express")
// const router = express.Router();

// router.get('/',(req,res)=>{
//     obj={
//         a:'this',
//         number:34
//     }
//     res.json(obj)
// })

// module.export = router
const express = require('express');
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs")
const { body, validationResult } = require('express-validator')
const jwt = require("jsonwebtoken")
const JWT_SECRETE = "Harryisagood$boy";
const fetchuser = require("../middleware/fetchuser")
//Route 1:  Create user using: POST "api/auth/createuser"

router.post('/createuser', [
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('email', "Enter a valid email address").isEmail(),
    body('password', "Enter a valid password").isLength({ min: 8 }),
], async (req, res) => {
    // if there are errors, return bad request and the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    // Check the user is exit or not
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email is already exits" })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt);
        // Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            // password: req.body.password
        })
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRETE)
        // console.log(authtoken)
        // res.json(user)
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }

})
//Route 2:  Login a user using POST: "/api/auth/login". No login required
router.post('/login', [
    body('email', "Enter a valid email address").isEmail(),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {
    // if there are errors, return bad request and the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with currect credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with currect credentials" })
        }
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRETE)
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})
//Route 3:  Get login user details using POST: "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
       userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user )
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})
module.exports = router