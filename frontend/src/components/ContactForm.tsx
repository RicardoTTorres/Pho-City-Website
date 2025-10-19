
import { useState, type FormEvent } from "react"

export const ContactForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/contact', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (res.ok) {
        alert('Message sent!')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        alert('Failed to send message.')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Something went wrong.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 flex flex-col gap-4">
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className ="text-foretext-foreground bg-input-background border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ringground"/>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className ="text-foregrtext-foreground bg-input-background border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ringound" />
      <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} required className ="text-fortext-foreground bg-input-background border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ringeground"/>
      <button type="submit" className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">Send</button>
    </form>
  )
}
