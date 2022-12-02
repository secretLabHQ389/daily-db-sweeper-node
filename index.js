var neo4j = require('neo4j-driver')
var axios = require('axios')
require('dotenv').config()

const manageFreeTrials = () => {
  const driver = neo4j.driver(
    process.env.DATABASE,
    neo4j.auth.basic(
      process.env.USERNAME,
      process.env.PASSWORD
    )
  )
  const session = driver.session()


  //Create a new user
  var email = Math.round(Math.random() * 3000000);
  var password = 'dTf7$(ld)'
  var d = new Date().toISOString()

  session
    .run('CREATE(n:User {email: $email, password: $password, timeStamp: $timestamp}) RETURN n',
      {
        email: email,
        password: password,
        timestamp: d
      }
    ).then(function(result1) {
      //Discord, "[username] created."
      axios.post(`https://discord.com/api/webhooks/${process.env.DISCORDHANDLE}/${process.env.DISCORDTOKEN}`, {
        content: `${email} created.`
      })
    })
    .catch(function(error){
      console.log(error)
    });

  //Check for users created in the past two days

  //Discord, "Users created in the past two days: [username id], [username id], [username id]"

  //Check for users with a timestamp from 13 days ago

  //Discord, "Free trials expiring tomorrow: [username id], [username id]"

  //Delete all users with a timestamp from 14 days ago

  //Send the deleted users the Signup email

  //Discord, "Free trials ended today: [username id], [username id]"

}

manageFreeTrials()
