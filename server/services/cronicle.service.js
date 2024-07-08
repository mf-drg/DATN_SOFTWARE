export async function createSchedule(hour, minute, weekdays, callbackPayload) {
  try {
    const cronicleUrl = process.env.CRONICLE_API_URL
    const cronicleApiKey = process.env.CRONICLE_API_KEY
    const baseApiUrl = process.env.BASE_API_URL
    const apiKey = process.env.APP_API_KEY
    const payload = {
      catch_up: 0,
      category: 'general',
      cpu_limit: 5,
      enabled: 1,
      max_children: 1,
      memory_limit: 10485760,
      plugin: 'urlplug',
      target: 'allgrp',
      timezone: 'Asia/Saigon',
      timing: { weekdays, hours: [Number(hour)], minutes: [Number(minute)] },
      title: 'HUST CRON',
      params: {
        method: 'POST',
        url: baseApiUrl + '/api/v1/mqtt/publish/state',
        headers: 'User-Agent: Cronicle/1.0\nContent-Type: application/json\nx-api-key: ' + apiKey,
        data: JSON.stringify(callbackPayload),
        timeout: '30',
        follow: 0
      },
    }
    const options = {
      method: 'POST',
      headers: {
        'X-API-Key': cronicleApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
    const response = await fetch(cronicleUrl + '/api/app/create_event/v1', options)

    const jsonResponse = await response.json()

    return jsonResponse
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateSchedule(id, hour, minute, weekdays) {
  try {
    const cronicleUrl = process.env.CRONICLE_API_URL
    const cronicleApiKey = process.env.CRONICLE_API_KEY
    const payload = {
      id,
      timing: { weekdays, hours: [hour], minutes: [minute] },
    }
    const options = {
      method: 'POST',
      headers: {
        'X-API-Key': cronicleApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
    const response = await fetch(cronicleUrl + '/api/app/update_event/v1', options)
    return await response.json()
  } catch (e) {
    console.log(e)
    throw e
  }
}
export async function deleteSchedule(id) {
  try {
    const cronicleUrl = process.env.CRONICLE_API_URL
    const cronicleApiKey = process.env.CRONICLE_API_KEY
    const abortJobOptions = {
      method: 'POST',
      headers: {
        'X-API-Key': cronicleApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, enabled: 0, abort_jobs: 1 }),
    }
    const options = {
      method: 'POST',
      headers: {
        'X-API-Key': cronicleApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }
    await fetch(cronicleUrl + '/api/app/update_event/v1', abortJobOptions)
    const response = await fetch(cronicleUrl + '/api/app/delete_event/v1', options)
    return await response.json()
  } catch (e) {
    console.log(e)
    throw e
  }
}
