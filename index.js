const express = require('express') //importing express and putting into variable/constant express
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
app.use(cors({ origin: "*" }))
const Server = require("socket.io");
require('dotenv').config()
const formidable = require('formidable')
const cloudinary = require('cloudinary')
app.use(express.static(__dirname + '/public'))
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


app.use(express.static(path.resolve(__dirname, "./build")));
app.use(express.static(__dirname + '/build/static'))
const userSchema = new mongoose.Schema(
    {
        Phone: String,
        username: String,
        password: String,
        ID: String,
        email: String

    }
)
const feedbackSchema = new mongoose.Schema(
    {
        fullname: String,
        email: String,
        feedback: String
    }
)
const userDeletedPostSchema = new mongoose.Schema({
    username: String,
    postContent: String,
    time: String,
    date: String
})
const userApprovedPostSchema = new mongoose.Schema({
    username: String,
    postContent: String,
    time: String,
    date: String
})
const userPostSchema = new mongoose.Schema({
    username: String,
    postContent: String,
    time: String,
    date: String,
    newsimg: String,
    newsTopic: String,
})

const userProfileSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    address: String,
    userName: String,
    bio: String,
    fbLink: String,
    twitterLink: String,
    igLink: String,
    gitHubLink: String,
    website: String,
    dateofbirth: Date,
    img: String,
    username: String
})
const userModel = mongoose.model("user", userSchema)
const userPostModel = mongoose.model("prepost", userPostSchema)
const userApprovedPostModel = mongoose.model("post", userApprovedPostSchema)
const userDeletedPostModel = mongoose.model("deletedpost", userDeletedPostSchema)
const feedbackModel = mongoose.model("feedback", feedbackSchema)
const userProfileModel = mongoose.model("profile", userProfileSchema)

app.use(bodyParser.json({limit: "100mb"}))
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const url = process.env.URL
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }))

mongoose.connect(url, (err) => {
    if (err) {
        console.log(err.message);
        console.log("Error");
    }
    else {
        console.log("mongoose don connect sha");
    }
})
const PORT = process.env.PORT
var connection = app.listen(PORT, () => { console.log(`app is running on port ${PORT}`) })
app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, './build', 'index.html'))
})
app.post('/signup', (request, response) => {
    const newUserForm = request.body
    const myPlaintextPassword = newUserForm.password
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(myPlaintextPassword, salt);
    const newForm = {
        phone: newUserForm.phone,
        username: newUserForm.username,
        email: newUserForm.email,
        ID: newUserForm.ff,
        password: hash
    }
    console.log(newForm)
    userModel.find({ email: newForm.email }, (err, result) => {
        if (result.length > 0) {
            console.log("Email exists")
            response.send({ message: `Email already exists.`, text: 'no' })
        }
        else {
            userModel.find({ username: newForm.username }, (err, result) => {
                if (result.length > 0) {
                    console.log("Username exists")
                    response.send({ message: `Username already exists.`, text: 'no' })
                }
                else {
                    response.send({ message: 'Success', text: 'yes' })
                    let formm = new userModel(newForm)
                    console.log("Done")
                    formm.save()
                }
            })
        }
    })
})
app.post('/login', (request, response) => {
    const loginform = request.body
    console.log(loginform);
    const newLogin = {
        username: loginform.username,
        password: loginform.password
    }

    const usernameee = loginform.username
    let found = userModel.find({ username: usernameee }, (err, result) => {
        if (err) {
            console.log(err.message)
        }
        else if (result.length == 0) {
            console.log("Nothing")
            response.send({ message: `Dear ${usernameee}, you do not have an account here...`, result })

        }
        else if (result) {
            console.log(result)
            const username = (result[0].username)
            const passw = result[0].password;
            const myPlaintextPassword = newLogin.password;
            bcryptjs.hash(myPlaintextPassword, 10)
                .then((hash) => {
                    return bcryptjs.compare(myPlaintextPassword, passw)
                }).then((result) => {
                    console.log("")
                    if (result == true) {
                        jwt.sign({ username }, process.env.JWT_SECRET, function (err, token) {
                            console.log(token);
                            response.send({ message: "Your login is successful!", result, token, username })
                        });

                    }
                    else {
                        response.send({ message: "I don't know what's up, but your password is definitely wrong!", result })
                    }
                })
            // response.send({result})
        }
        else {
            response.send({ message: "I don't know what's up", result })
            // response.send({result})
        }


    })
})
app.get('/dashcheck', (request, response) => {
    const auth = request.headers.authorization
    const token = auth.split(' ')[1]
    console.log(token)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(`jwt could not be decoded`)
            response.send({ message: err.message })
        }
        else {
            console.log(decoded.username)
            response.send({ message: 'verification successful', username: decoded.username })
        }
    })
})
app.get('/geteverything', (request, response) => {
    const all = {}
    userModel.find({ zeroorone: 1 }, (err, result) => {

        if (result) {

            const c = result.length
            all.c = c
            console.log(all)


        }
    })

    userApprovedPostModel.find((err, result) => {

        if (result) {
            const a = result.length
            all.a = a
            console.log(all)
        }
    })
    userModel.find({ zeroorone: 0 }, (err, result) => {

        if (result) {

            const d = result.length
            response.send(all)
            all.d = d
        }

    })
})

app.post('/adminapproval', (request, response) => {
    console.log(request.body.time)

    const form = request.body
    const oldPath = form.postpicture
    console.log(form)

    cloudinary.v2.uploader.upload(oldPath, (error, result) => {

        if (error) {
            console.log(error)
        }
        else {
            console.log(result)
            const newPost = {
                newsimg: result.secure_url,
                username: request.body.username,
                postContent: request.body.postdetails,
                time: request.body.time,
                date: request.body.date
            }
            // console.log(newPost)
        let sendToAdmin = new userPostModel(newPost)
        console.log(sendToAdmin)
        sendToAdmin.save()
        }

    })
})


app.get('/admincheck', (request, response) => {
    let found = userPostModel.find((err, result) => {
        response.send(result)
    })
})
app.post('/getprofile', (request, response) => {
    userProfileModel.findOne({ username: request.body.username }, (err, result) => {
        if (result) {
            console.log(result)
            response.send(result)
            console.log("Profile exists")
        }
        else if (err) {
            response.send("An error occurred")
        }
        else {

            response.send("not found")
            console.log("No profile found")
        }
    })
})
app.post('/approvepost', (request, response) => {
    const id = request.body.id
    userPostModel.find({ _id: id }, (err, result) => {
        console.log(request.body)
        const post = result[0]
        const newPost = {
            theimg: post.newsimg,
            username: post.username,
            postContent: post.postContent,
            time: post.time,
            date: post.date
        }
        // console.log(newPost)
        let sendToNewsfeed = new userApprovedPostModel(newPost)
        // console.log(sendToNewsfeed)
        sendToNewsfeed.save()
        userPostModel.deleteOne({ _id: post._id }, (err, result) => {
        })
    })
})
app.post('/changeprofile', (request, response) => {
    console.log(request.body)
    let formm = new userProfileModel(request.body)
    found = userProfileModel.findOne({ username: request.body.username }, (err, result) => {
        if (result) {
            console.log(result)
            console.log("Profile exists")
            userProfileModel.deleteOne({ username: request.body.username }, (result, err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result)
                }
            })
            response.send({ message: "Updated" })
            formm.save().then((err, result) => {
                if (result) {
                    console.log(result)
                } else {
                    console.log(err)
                }
            })
        }
        else if (err) {
            console.log(err.message)
        }
        else {
            response.send({ message: "added" })
            formm.save().then((err, result) => {
                if (result) {
                    console.log(result)
                } else {
                    console.log(err)
                }
            })
        }
    })
})
app.post('/deletepost', (request, response) => {
    const id = request.body.id
    userPostModel.find({ _id: id }, (err, result) => {
        // console.log(result)
        const post = result[0]
        const newPost = {
            username: post.username,
            postContent: post.postContent,
            time: post.time,
            date: post.date
        }
        // console.log(newPost)
        let sendToDelposts = new userDeletedPostModel(newPost)
        // console.log(sendToNewsfeed)
        sendToDelposts.save()
        userPostModel.deleteOne({ _id: post._id }, (err, result) => {
        })
    })
})
app.get('/userscheck', (request, response) => {
    let found = userApprovedPostModel.find((err, result) => {
        response.send(result)
    })
})
app.post('/getUserType', (request, response) => {
    console.log(request.body)
    const username = request.body.username
    let found = userModel.find({ username: username }, (err, result) => {
        response.send(result[0].zeroorone)
    })
})
// const io = Server(connection, {cors:{options:'*'}})
//     io.on('connection', (socket) => {
//         console.log("Someone joined")
//         socket.on('disconnect', (socket) => {
//             console.log("Someone left")
//         });
//         socket.on('messageInput',(newMessage)=>{
//             console.log(newMessage)
//             io.emit('messageOutput',(newMessage))
//         })
//     });

//     app.post('/chat', (request,response)=>{
//         const username=request.body.username
//     console.log(`${username} entered the chat`)
// })


app.post('/feedback', (request, response) => {
    const newFeedback = {
        fullname: request.body.fullname,
        email: request.body.email,
        feedback: request.body.feedback
    }
    console.log(request.body)
    let theFeedback = new feedbackModel(newFeedback)
    console.log(theFeedback)
    theFeedback.save()
})