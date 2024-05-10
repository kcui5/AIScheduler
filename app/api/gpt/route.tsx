import { NextResponse } from "next/server"

import OpenAI from 'openai'

export const maxDuration = 30 // This function can run for a maximum of 30 seconds

const openai = new OpenAI()

const SYSTEM_PROMPT = `You are an assistant dedicated to helping maintain users schedules.
Your goal is to provide the most optimal schedule and ordering of todos with any given constraints, 
assigning higher priority tasks earlier. You will be given a list of tasks and the current time,
your job is to decide on the ordering of those tasks and then assign them to each hour or half hour in the day.
Every hour of the day for the next few days required to complete the given tasks should be accounted for,
if there is nothing to do you can fill it in with free time.
Once you decide on an ordering, respond with a numbered list of those tasks, without providing an explanation
or any other information. Respond with solely a succinct, clear numbered list of tasks,
with their corresponding time in the day in AM and PM format. For example, you can return Do homework 4-7pm as one list item.
Also explicitly include meal times for three meals a day and sleep (generally aiming for 8 hours from 10pm
to 6am) integrated into the list at appropriate times.`;

//provide estimate for reasonable amount of time to take this task
//input task with detailed descriptions
//input priority via eisenhower decision matrix

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const message = body.message
        const time = body.clientTime
        const user_message = `${message} It is currently ${time}.`
        console.log(user_message)
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: user_message },
            ],
            model: "gpt-4-turbo",
        })
        console.log(completion.choices[0].message.content)
        return NextResponse.json({ message: completion.choices[0].message.content }, { status: 200 })
    } catch(err) {
        console.log("OPENAI API CALL ERROR")
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
}