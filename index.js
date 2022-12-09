var neo4j = require('neo4j-driver')
var axios = require('axios')
var nodemailer = require('nodemailer')
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
  var email = 'yourfesource@gmail.com' //Math.round(Math.random() * 3000000);
  var password = 'dTf7$(ld)'
  var d = new Date().toISOString()

  //Send expiration email:
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.EMAIL_ACCOUNT}`,
      pass: `${process.env.EMAIL_PASSWORD}`
    }
  })

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

      session
        .run('MATCH(n:User) RETURN n')
          .then(function(result1) {

            //Check for users with a timestamp from the past two days ago
            let pastTwoDays = []
            //Check for users with a timestamp from 13 days ago
            let freeTrialExpiringTomorrow = []
            //Check for users with a timestamp from 14 days ago
            let freeTrialExpiring = []
            //Check for real user and not seed data:
            let expiringRealUsers = []
            var emailRGEX = /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/g

            //Add more logic for start and stop of the month:
            result1.records && result1.records.map(record => {
              if (parseInt(record._fields[0].properties.timeStamp?.slice(8,10)) + 2 >= parseInt( d.slice(8,10))) {
                pastTwoDays.push(record._fields[0].properties.email)
              }
              if (parseInt(record._fields[0].properties.timeStamp?.slice(8,10)) + 13 === parseInt(d.slice(8,10))) {
                freeTrialExpiringTomorrow.push(record._fields[0].properties.email)
              }
              if (parseInt(record._fields[0].properties.timeStamp?.slice(8,10)) + 14 === parseInt(d.slice(8,10))) {
                freeTrialExpiring.push(record._fields[0].properties.email)
              }
              if ((parseInt(record._fields[0].properties.timeStamp?.slice(8,10)) + 14 === parseInt(d.slice(8,10))) && (emailRGEX.test(record._fields[0].properties.email))) {
                expiringRealUsers.push(record._fields[0].properties.email)
              }
            })

            //Discord, "Users from past two days: [username], [username], [username]."
            axios.post(`https://discord.com/api/webhooks/${process.env.DISCORDHANDLE}/${process.env.DISCORDTOKEN}`, {
              content: `Users from past two days: ${pastTwoDays}.`
            })

            //Discord, "Free trials expiring tomorrow: [username], [username]."
            axios.post(`https://discord.com/api/webhooks/${process.env.DISCORDHANDLE}/${process.env.DISCORDTOKEN}`, {
              content: `Free trials expiring tomorrow: ${freeTrialExpiringTomorrow}.`
            })

            freeTrialExpiring && freeTrialExpiring.map(expired => {
              //Delete all users with a timestamp from 14 days ago
              session
                .run('MATCH(n:User {email: $expiredEmail}) RETURN n', {
                  $expiredEmail: expired
                })
                .then(
                  console.log(expired, ' deleted')
                )
                .catch(function(error){
                  console.log(error)
                })
            })

            expiringRealUsers && expiringRealUsers.map(expired => {
              //Send the deleted users the Signup email
              var mailOptions = {
                from: `${process.env.EMAIL_ACCOUNT}`,
                to: `${expired}`,
                subject: 'Rent Hub- Free Trial Over',
                text: `
                Dear ${expired},

                We hope you enjoyed your free trial. Please contact us

                at director_contact@mightyapps.org

                to discuss subscriptions ranging from basic for

                the cost of a gym membership to white labeling just for you.

                Sincerely,

                Mighty Apps

                `
              }

              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log('Error: ', error)
                } else {
                  console.log('Email sent: ', info.response)
                }
              })
            })

            //Discord, "Free trials ended today: [username], [username]"
            axios.post(`https://discord.com/api/webhooks/${process.env.DISCORDHANDLE}/${process.env.DISCORDTOKEN}`, {
              content: `Free trials ended today: ${freeTrialExpiring}.`
            })
          })
        .catch(function(error){
          console.log(error)
        })
      })
    .catch(function(error){
      console.log(error)
    })

}

manageFreeTrials()
