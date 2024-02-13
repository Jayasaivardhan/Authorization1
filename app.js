let express = require('express')
let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let bcrypt = require('bcrypt')
let path = require('path')
let db = null
let dbpath = path.join(__dirname, 'userData.db')
let app = express()
app.use(express.json())

const initialiseDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running by kalki....')
    })
  } catch (e) {
    console.log(`The error is ${e.message}`)
    process.exit(1)
  }
}
initialiseDbandServer()

app.post('/register', async (request, response) => {
  let {username, name, password, gender, location} = request.body
  let checkUser = `select * from user where username='${username}';`
  let userDetail = await db.get(checkUser)
  const hashedPassword = await bcrypt.hash(password, 10)

  if (userDetail !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else if (password.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    let query = `insert into  user
                 (username,name,password,gender,location)
                 values 
                 ('${username}',
                 '${name}',
                 '${hashedPassword}',
                 '${gender}',
                 '${location}');`
    let res = await db.run(query)
    response.status(200)
    response.send('User created successfully')
  }
})

app.post('/login', async (request, response) => {
  let {username, password} = request.body
  let checkUser = `select * from user where username= '${username}';`
  let res = await db.get(checkUser)
  if (res === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    let resu = await bcrypt.compare(password, res.password)
    if (resu === true) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

app.put('/change-password', async (request, response) => {
  let {username, oldPassword, newPassword} = request.body
  let checkUser = `select * from user where username='${username}';`
  let resove = await db.get(checkUser)
  let passCheck = await bcrypt.compare(oldPassword, resove.password)

  if (passCheck === true) {
    if (newPassword.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const newpass = await bcrypt.hash(newPassword, 10)
      let query = `update user set password='${newpass}';`
      let resolve = await db.run(query)
      response.status(200)
      response.send('Password updated')
    }
  } else {
    response.status(400)
    response.send('Invalid current password')
  }
})

module.exports = app
