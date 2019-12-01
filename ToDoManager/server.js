const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const SEGREDO = 'euvoupracasa';

const validUsername = 'usuario'
const validPassword = '123456'

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function cobrarTokenJWT(request, response, next) {
    if (request.url == '/login' || request.url == '/') {
        next();
    }
    
    var token = request.headers['x-access-token'];

    try {
        var decodificado = jwt.verify(token, SEGREDO);
        next();
    } catch (exception) {
        response.status(401).send({message: 'token is not valid'});
    }
}

app.use(cobrarTokenJWT);
// REST Methods
app.get('/', (request, response) => {
    response.send({'message':'ok'});
});

app.post('/login', (request, response) => {
    var body = request.body;

    if (body.username == validUsername && body.password == validPassword) {
        var token = jwt.sign({ username: 'usuario', role: 'admin'}, SEGREDO, {
            expiresIn: '1h'
        });
        response.status(200).send({token});
    } else {
        response.status(401).send({ message: 'Error in username or password' });
    }
});

var tasks = [];

app.post('/tasks', (request, response) => {
    const body = request.body;
    const task = {
        id: uuid(),
        title: body.title,
        description: body.description, 
        isDone: body.isDone,
        isPriority: body.isPriority
    };

    tasks.push(task);
    response.status(201).send(task);
});

app.get('/tasks', (request, response) => {
    response.status(200).send(tasks);
}) 

app.put('/tasks/:taskId', (request, response) => {
    const body = request.body;
    const taskId = request.params.taskId

    const task = tasks.find(task => task.id == taskId);
    
    if (task) {
        task.title = body.title;
        task.description = body.description;
        task.isDone = body.isDone;
        task.isPriority = body.isPriority;
        response.send(task);
    } else {
        response.status(404).send({ message : 'task not found'});
    }
});

app.get('/tasks/:taskId', (request, response) => {
    const taskId = request.params.taskId;
    const task = tasks.find(task => task.id == taskId);
    
    if (task) {
        response.status(200).send(task);
    } else {
        response.status(404).send({ message : 'task not found'});
    }
})

app.delete('/tasks/:taskId', (request, response) => {
    const taskId = request.params.taskId;
    var task = tasks.find(task => task.id == taskId);

    if (task) {
        remove(tasks, task);

        response.status(200).send(task);
    } else {
        response.status(404).send({ message : 'task not found'});
    }
});

function remove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

app.listen(3000, () => console.log('Server started on port 3000!'));