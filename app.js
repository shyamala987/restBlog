var express = require("express"),
	app = express(),
	methodOverride = require("method-override"),
	bodyParser = require("body-parser"),
	expressSanitizer = require("express-sanitizer"),
	mongoose = require("mongoose")

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(methodOverride("_method"))
app.use(expressSanitizer())
// MONGOOSE
mongoose.connect('mongodb://localhost:27017/restful_blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(function() {console.log('Connected to DB!')})
.catch(function(error) {console.log(error.message)});

var BlogSchema = new mongoose.Schema({
	name: String,
	image: String,
	body: String,
	created: {type: Date, default:Date.now}
})

var Blog = new mongoose.model("Blog", BlogSchema)

// ROUTES...
app.get('/', function(req, res) {
	res.redirect('/blogs')
})

// INDEX
app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err)
		} else {
			res.render('index', {blogs: blogs})
		}
	})
})

// NEW
app.get('/blogs/new', function(req, res) {
	res.render('newBlog')
})

// CREATE
app.post('/blogs', function(req, res) {
	var blog = req.body.blog
	blog.body = req.sanitize(blog.body)
	Blog.create(blog, function(err, blogs) {
		if (err) {
			console.log('Error creating blog!')
		}
		else {
			res.redirect('/blogs')
		}
	})
})

// SHOW
app.get('/blogs/:id', function(req, res) {
	//res.render('show', {id: id})
	Blog.findById(req.params.id, function(err, blog) {
		if (err) {
			console.log(err)
		} else {
			res.render('show', {blog: blog})
		}
	})
	//res.send("HERE YOU GO!")
})

// EDIT
app.get('/blogs/:id/edit', function(req, res) {
	Blog.findById(req.params.id, function(err, blog) {
		if (err) {
			console.log(err)
		} else {
			blog.body = req.sanitize(blog.body)
			res.render('edit', {blog: blog})
		}
	})
})

// UPDATE
app.put('/blogs/:id', function(req, res) {
	//res.send("Update Route")
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			console.log(err)
		} else {
			res.redirect('/blogs/'+req.params.id)
		}
	})
})

// DELETE
app.delete('/blogs/:id', function(req, res) {
	Blog.findByIdAndDelete(req.params.id, function(err, deleted) {
		if (err) {
			console.log(err)
		} else {
			res.redirect('/blogs')
		}
	})
})

// LISTEN...
app.listen(process.env.PORT || 3000, function() {
	console.log("Welcome to Shyamala's blog")
})