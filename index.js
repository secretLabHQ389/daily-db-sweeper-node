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

  //User-
  //name= Math.random()
  //timestamp created
  //other properties

  //Create a new user
  session.run('MATCH(a:User) RETURN a').then(function(result1) {
    console.log('Users found: ', result1)
  })
  //Discord, "[username id] created."

  //Check for users created in the past two days

  //Discord, "Users created in the past two days: [username id], [username id], [username id]"

  //Check for users with a timestamp from 13 days ago

  //Discord, "Free trials expiring tomorrow: [username id], [username id]"

  //Delete all users with a timestamp from 14 days ago

  //Send the deleted users the Signup email

  //Discord, "Free trials ended today: [username id], [username id]"

}

manageFreeTrials()
