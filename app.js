const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')
const format = require('date-fns/format')

const toDate = require('date-fns/toDate')

const isValid = require('date-fns/isValid')

app.use(express.json())
const dbPath = path.json(__dirname, "todoApplication.db");

let db = null;

const intializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
  }
}

intializeDBandServer()

const checkRequestsQueries = async (request, response, next) => {
  const { search_q, category, priority, status, date } = request.query;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArry = ["WORK", "HOME", "LEARNING"];
    const categgoryIsInArray = categoryArry.includes(category);
    if (categgoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArry = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArry.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (date !== undefined) {
    try{
      const myDate = new Date(date);

      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, "f")
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );
      console.log(result, "r");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");
      if (isValidDate === true) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    }catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;

  next();

};

const checkRequestsBody = async (request, response, next) => {
  const { search_q, category, priority, status, dueDate } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArry = ["WORK", "HOME", "LEARNING"];
    const categgoryIsInArray = categoryArry.includes(category);
    if (categgoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArry = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArry.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    try{
      const myDate = new Date(dueDate);

      const formatedDate = format(new Date(dueDate)), "yyyy-MM-dd");
      console.log(formatedDate)
      const result = toDate(
        new Date(formatedDate));
      const isValidDate = isValid(result)
      console.log(isValidDate);
      console.log(isValidDate)
      if (isValidDate === true) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    }catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todo = todo;
  request.id = id;
  request.todoId = todoId;

  next();

};
//Get Todos API-1 

app.get("/todos/", checkRequestsQueries, async (request, response) => {
  const { status = "", search_q="", priority="", category="" } = request;
  console.log(status, search_q, priority, category);
  const getTodosQuery = `
  SELECT 
      id,
      todo,
      priority,
      status,
      category,
      due_date As dueDate
  FROM 
     todo
  WHERE 
  todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%'
  AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;


  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
      
});

//GET Todo API-2 
app.get("/todos/:todoId", checkRequestsQueries, async (request, response) => {
  const { todoId } = request;

  const getTodosQuery = `
     SELECT  
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate 
    FROM 
       todo
    WHERE 
       id = ${todoId};`; 

  const todo = await db.get(getTodosQuery);
  response.send(todo);
});

//GET Agenda API-3 

app.get("/agenda/", checkRequestsQueries, async (request, response) => {
  const { date } = request;
  console.log(date, "a")
  const selectDuaDateQuery = `
     SELECT  
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate 
    FROM 
       todo
    WHERE 
       id = ${date};`; 

  const todosArray = await db.all(selectDuaDateQuery);

  if (todosArray === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    response.send(todosArray);
  }
 
});

//Add Todo API-4 

app.post("/todos/", checkRequestsBody, async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request;

  const addTodoQuery = `
        INSERT INTO 
             todo (id, todo, priority, status, category, due_date)
        VALUES 
            (   
               ${id},
               '${todo}',
               '${priority}',
               '${category}',
               '${dueDate}'
            )
        ;`;

  const creatUser = await db.run(addTodoQuery);
  console.log(creatUser)
  response.send("Todo Successfully Added")

});

add.put("/todos/:todoId/", checkRequestsBody, async (request, response) => {
  const { todoId } = request;

  const { priority, todo, status, dueDate, category };
  let updateQuery = null;

  console.log(priority, todo, status, dueDate, category);
  switch (true) {
    case status !== undefined:
      updateQuery = `
           UPDATE 
              todo 
           SET 
              status = '${status}' 
           WHERE 
              id = '${todoId}'
       ;`;

       await db.run(updateQuery);
       response.send("Status Updated") 
       break;
    case priority !== undefined:
      updateQuery = `
           UPDATE 
              todo 
           SET 
              status = '${priority}' 
           WHERE 
              id = '${todoId}'
       ;`;

       await db.run(updateQuery);
       response.send("Priority Updated") 
       break;
    case todo !== undefined:
      updateQuery = `
           UPDATE 
              todo 
           SET 
              status = '${todo}' 
           WHERE 
              id = '${todoId}'
       ;`;

       await db.run(updateQuery);
       response.send("Todo Updated") 
       break;
    case category !== undefined:
      updateQuery = `
           UPDATE 
              todo 
           SET 
              status = '${category}' 
           WHERE 
              id = '${todoId}'
       ;`;

       await db.run(updateQuery);
       response.send("Category Updated") 
       break;
    case dueDate !== undefined:
      updateQuery = `
           UPDATE 
              todo 
           SET 
              status = '${dueDate}' 
           WHERE 
              id = '${todoId}'
       ;`;

       await db.run(updateQuery);
       response.send("Due Date Updated") 
       break;
  }
});

//Delecte Todo API-6 

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
           DELETE FROM 
               todo 
           WHERE 
              id=${todoId}
      ;`;

    await db.run(deleteTodoQuery);
    response.send("Todo Deleted");
      
});

module.exports = app; 





     

     