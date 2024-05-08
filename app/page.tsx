"use client"

import React, { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from 'path'

require('dotenv').config();

const formSchema = z.object({
    message: z.string().max(500),
})

export default function Home() {
  const [gptResponse, setGptResponse] = useState('')
  const [checkedList, setCheckedList] = useState([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const msg = values.message
    const userInput = {
      message: msg,
    }
    
    try {
      const response = await axios.post('/api/gpt', userInput)
      setGptResponse(response.data)
    } catch(err) {
      setGptResponse('error')
    }    
  }

  async function checkI(index: number) {
    console.log(index)
  }

  return (
    <div>
      
      <div className="p-10">
        <h1 className="pb-5 font-bold">AI Scheduler</h1>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tasks</FormLabel>
                <FormControl>
                  <Textarea className="w-1/2 h-1/2" placeholder="Tasks..." {...field} />
                </FormControl>
                <FormDescription>
                  Tell me what tasks you need to get done and I'll tell you the order to do them in.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
          <div>{
            gptResponse.split('\n').map((line, i) => (
            line.trim() !== '' && (
            <div>
              <Checkbox id={`${i.toString()}`} key={`checkbox ${i}`} onCheckedChange={() => checkI(i)}/>
                <label className="pl-3" htmlFor={`${i.toString()}`} key={`label ${i}`}>{line}<br/></label>
            </div>)))
          }</div>
        </form>
        </Form>
      </div>
    </div>
  )
}
