import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data

    try {
      await prisma.user.create({
        data: {
          id,
          email: email_addresses[0].email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          firstName: first_name || null,
          lastName: last_name || null,
          image: image_url || null,
          username: username || null,
          lastLoginAt: new Date(),
        },
      })

      console.log('User created in database:', id)
    } catch (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Error creating user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data

    try {
      await prisma.user.update({
        where: { id },
        data: {
          email: email_addresses[0].email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          firstName: first_name || null,
          lastName: last_name || null,
          image: image_url || null,
          username: username || null,
          updatedAt: new Date(),
        },
      })

      console.log('User updated in database:', id)
    } catch (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Error updating user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await prisma.user.delete({
        where: { id: id! },
      })

      console.log('User deleted from database:', id)
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Error deleting user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'session.created') {
    const { user_id } = evt.data

    try {
      await prisma.user.update({
        where: { id: user_id },
        data: { lastLoginAt: new Date() },
      })

      console.log('User login tracked:', user_id)
    } catch (error) {
      console.error('Error tracking login:', error)
    }
  }

  return new Response('', { status: 200 })
}
