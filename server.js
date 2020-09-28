const express = require('express');
const mongodb = require('mongodb');

const PORT = process.env.PORT;

if (PORT === null || PORT === '') {
  PORT = 5000;
}

const app = express();

let db;
app.use(express.static('public'));

const dbURI =
  'mongodb+srv://tyler:tyler123@cluster0.m29ap.mongodb.net/TodoApp?retryWrites=true&w=majority';

mongodb.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    db = client.db();
    app.listen(PORT, () => console.log('server started on ' + PORT));
  }
);

// tells express to automatically add the form submitted data to a body object
// and then add that body object to the request object
// so now you can access the form's value
app.use(express.urlencoded({ extended: false }));

// tells express to do the same thing, except instead of for submitted forms,
// it will do it for asynchronous requests.
app.use(express.json());

function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App');
  console.log(req.headers.authorization);
  if (req.headers.authorization == 'Basic R3Vlc3Q6Y2hpY2tlbjEyMw==') {
    next();
  } else {
    res.status(401).send('Authentication required.');
  }
}

app.use(passwordProtected);

app.get('/', (req, res) => {
  db.collection('items')
    .find()
    .toArray((err, items) => {
      res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id='item-list' class="list-group pb-5">
        
    </ul>
    
  </div>

  <script>
  let items = ${JSON.stringify(items)}
  </script>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src='/browser.js'></script>
</body>
</html>`);
    });
});

app.post('/create-item', (req, res) => {
  let safeText = req.body.text;
  db.collection('items').insertOne({ text: safeText }, (err, info) =>
    res.json(info.ops[0])
  );
});

app.post('/update-item', (req, res) => {
  let safeText = req.body.text;
  db.collection('items').findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    () => {
      res.send('Success');
    }
  );
});

app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    () => res.send('success')
  );
});
