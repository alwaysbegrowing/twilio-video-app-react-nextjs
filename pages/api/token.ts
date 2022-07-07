import type { NextApiRequest, NextApiResponse } from 'next'

import { jwt } from 'twilio'
const { VideoGrant } = jwt.AccessToken
const { ChatGrant } = jwt.AccessToken

// A lot of the code is from
// https://github.com/twilio-labs/plugin-rtc/blob/master/src/serverless/functions/token.js

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_API_KEY ||
  !process.env.TWILIO_API_SECRET ||
  !process.env.CONVERSATIONS_SERVICE_SID
) {
  throw new Error('missing secrets')
}
const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, CONVERSATIONS_SERVICE_SID } =
  process.env

const client = require('twilio')(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room_name, user_identity: identity } = req.body

  let room

  try {
    // See if a room already exists
    room = await client.video.rooms(room_name).fetch()
  } catch (e) {
    try {
      // If room doesn't exist, create it
      room = await client.video.rooms.create({ uniqueName: room_name })
    } catch (e) {
      return res.status(500).json({ error: 'error creating room' })
    }
  }

  const conversationsClient = client.conversations.services(CONVERSATIONS_SERVICE_SID)

  try {
    // See if conversation already exists
    await conversationsClient.conversations(room.sid).fetch()
  } catch (e) {
    try {
      // If conversation doesn't exist, create it.
      // Here we add a timer to close the conversation after the maximum length of a room (24 hours).
      // This helps to clean up old conversations since there is a limit that a single participant
      // can not be added to more than 1,000 open conversations.
      await conversationsClient.conversations.create({
        uniqueName: room.sid,
        'timers.closed': 'P1D',
      })
    } catch (e) {
      return res.status(500).json({ error: 'error!' })
    }
  }

  try {
    await conversationsClient.conversations(room.sid).participants.create({ identity })
  } catch (e: any) {
    // Ignore "Participant already exists" error (50433)
    if (e?.code !== 50433) {
      console.log(identity, CONVERSATIONS_SERVICE_SID)
      console.log({ e })
      return res.status(500).json({ error: 'error creating participant' })
    }
  }

  const token = new jwt.AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, {
    identity,
  })
  const videoGrant = new VideoGrant({
    room: room_name,
  })
  token.addGrant(videoGrant)
  const chatGrant = new ChatGrant({ serviceSid: CONVERSATIONS_SERVICE_SID })
  token.addGrant(chatGrant)

  return res.status(200).json({
    token: token.toJwt(),
  })
}
