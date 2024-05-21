"use client"

import React, { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

require('dotenv').config();

const formSchema = z.object({
    message: z.string().max(5000),
})

const regenFormSchema = z.object({
    message: z.string().max(5000),
})

export default function Home() {
  const [gptResponse, setGptResponse] = useState('')
  const [checkedList, setCheckedList] = useState<boolean[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const regenForm = useForm<z.infer<typeof regenFormSchema>>({
    resolver: zodResolver(regenFormSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const msg = values.message
    const currentTime = new Date()
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true //for 12-hour format with AM/PM
    })
    const userTime = timeFormatter.format(currentTime)
    const userInput = {
      message: msg,
      clientTime: userTime,
    }
    
    try {
      setLoading(true)
      const response = await axios.post('/api/gpt', userInput)
      initializeCheckedList(response.data.message)
      setGptResponse(response.data.message)
      setLoading(false)
    } catch(err) {
      setGptResponse('error')
    }    
  }

  async function initializeCheckedList(res: String) {
    const items = res.split("\n")
    setCheckedList(Array(items.length).fill(false))
  }

  async function flipI(index: number) {
    setCheckedList(prevArray => {
      const newArray = [...prevArray];
      newArray[index] = !newArray[index];
      return newArray;
    })
  }

  async function onRegenerateSubmit(values: z.infer<typeof regenFormSchema>) {
    const msg = values.message
    const userInput = {
      edits: msg,
      checked: checkedList,
      oldTasks: gptResponse,
    }

    try {
      const response = await axios.post('api/gptRegen', userInput)
      initializeCheckedList(response.data.message)
      setGptResponse(response.data.message)
    } catch(err) {
      setGptResponse('error')
    }
  }

  return (
    <div>
      <div className="p-10">
        <h1 className="pb-2 font-bold text-2xl">AI Scheduler</h1>
        <h3 className="pb-5 text-slate-400 italic">@kile_sway</h3>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tasks</FormLabel>
                <FormControl>
                  <Textarea className="" placeholder="Tasks..." {...field} />
                </FormControl>
                <FormDescription>
                  Tell me what tasks you need to get done and I&apos;ll tell you the order to do them in.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
          <div>{
            // Taken from https://tenor.com/view/kakaotalk-emoticon-ompangie-pentol-buffering-gif-18260464
            // @kueape on tenor.com
            loading && <img src="kakaotalk-emoticon.gif" alt="Loading..." className="h-24 pl-2"/>
          }</div>
          <div>{
            gptResponse.split('\n').map((line, i) => (
            line.trim() !== '' && !loading && (
            <div key={`div ${i}`}>
              <Checkbox checked = {checkedList[i]} id={`${i.toString()}`} key={`checkbox ${i}`} onCheckedChange={() => flipI(i)}/>
                <label className="pl-3" htmlFor={`${i.toString()}`} key={`label ${i}`}>{line}<br/></label>
            </div>)))
          }</div>
        </form>
        </Form>

        <div className="pt-5">{
          gptResponse.trim() !== '' && !loading &&
          <Form {...regenForm}>
            <form onSubmit={regenForm.handleSubmit(onRegenerateSubmit)} className="space-y-4">
              <FormField
                control={regenForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regenerate</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Edits to regenerate..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Tell me edits you want to make to this schedule.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Regenerate</Button>
            </form>
          </Form> 
        }</div>
        <div className="pt-5">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>???</AccordionTrigger>
              <AccordionContent>
                I'm an AI Scheduler dedicated to helping you maintain your schedule and order your tasks in an optimized way.
                You can tell me your tasks and any context you'd like, such as priority, estimated time to complete, or anything else,
                and I'll decide on a schedule for you while taking into account the current time.
                <br ></br>
                <br ></br>
                In the list of tasks I return to you, you can check off the items you complete, then suggest edits to make to the schedule,
                such as adding new tasks or removing tasks. Then click the 'Regenerate' button to get a new iteration of the schedule with
                all of this information taken into account.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
