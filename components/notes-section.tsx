"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample notes data - in a real app, this would come from a database
const sampleNotes = [
  {
    id: "1",
    title: "Progress Tracking",
    content:
      "Starting to see improvements in core strength after 3 weeks of consistent Lagree workouts. Can hold plank to pike for 60 seconds now.",
    category: "progress",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    id: "2",
    title: "Workout Modifications",
    content:
      "For reverse lunges, try adding a pulse at the bottom of the movement for extra glute activation. Keep the front knee stable throughout.",
    category: "technique",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: "3",
    title: "Equipment Settings",
    content:
      "Megaformer spring settings: 2 springs for core work, 3-4 springs for leg work depending on exercise. Always check form before adding resistance.",
    category: "equipment",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
  },
]

export function NotesSection() {
  const [notes, setNotes] = useState(sampleNotes)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<(typeof sampleNotes)[0] | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "general",
  })
  const [isEditing, setIsEditing] = useState(false)

  const categories = [
    { id: "all", label: "All Notes" },
    { id: "general", label: "General" },
    { id: "progress", label: "Progress" },
    { id: "technique", label: "Technique" },
    { id: "equipment", label: "Equipment" },
  ]

  const filteredNotes = activeCategory === "all" ? notes : notes.filter((note) => note.category === activeCategory)

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      const note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        createdAt: new Date(),
      }

      setNotes([note, ...notes])
      setIsAddNoteOpen(false)
      setNewNote({
        title: "",
        content: "",
        category: "general",
      })
    }
  }

  const handleUpdateNote = () => {
    if (selectedNote && newNote.title && newNote.content) {
      setNotes(
        notes.map((note) =>
          note.id === selectedNote.id
            ? {
                ...note,
                title: newNote.title,
                content: newNote.content,
                category: newNote.category,
              }
            : note,
        ),
      )
      setIsViewNoteOpen(false)
      setIsEditing(false)
    }
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    setIsViewNoteOpen(false)
  }

  const startEditing = () => {
    if (selectedNote) {
      setNewNote({
        title: selectedNote.title,
        content: selectedNote.content,
        category: selectedNote.category,
      })
      setIsEditing(true)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workout Notes</CardTitle>
            <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                  <DialogDescription>
                    Create a new note to track your progress, techniques, or equipment settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="note-title">Title</label>
                    <Input
                      id="note-title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="e.g., Progress Update"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="note-category">Category</label>
                    <select
                      id="note-category"
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="note-content">Content</label>
                    <Textarea
                      id="note-content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Write your note here..."
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote}>Save Note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Track your progress, techniques, and equipment settings</CardDescription>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mt-2">
            <TabsList className="grid grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredNotes.length > 0 ? (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle
                          className="text-base"
                          onClick={() => {
                            setSelectedNote(note)
                            setIsViewNoteOpen(true)
                          }}
                        >
                          {note.title}
                        </CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {note.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{format(note.createdAt, "MMMM d, yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p
                        className="text-sm text-muted-foreground line-clamp-3"
                        onClick={() => {
                          setSelectedNote(note)
                          setIsViewNoteOpen(true)
                        }}
                      >
                        {note.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No notes found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCategory === "all"
                    ? "Create your first note to get started"
                    : `No notes in the ${activeCategory} category`}
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddNoteOpen(true)}>
                  Create Note
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View/Edit Note Dialog */}
      <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            {!isEditing ? (
              <>
                <DialogTitle>{selectedNote?.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {selectedNote?.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedNote && format(selectedNote.createdAt, "MMMM d, yyyy")}
                  </span>
                </div>
              </>
            ) : (
              <>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogDescription>Make changes to your note</DialogDescription>
              </>
            )}
          </DialogHeader>

          {!isEditing ? (
            <div className="py-4">
              <p className="text-sm whitespace-pre-line">{selectedNote?.content}</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-title">Title</label>
                <Input
                  id="edit-title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories
                    .filter((c) => c.id !== "all")
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-content">Content</label>
                <Textarea
                  id="edit-content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {!isEditing ? (
              <>
                <div className="flex gap-2 mr-auto">
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
                  >
                    Delete
                  </Button>
                </div>
                <Button onClick={() => setIsViewNoteOpen(false)}>Close</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    if (selectedNote) {
                      setNewNote({
                        title: selectedNote.title,
                        content: selectedNote.content,
                        category: selectedNote.category,
                      })
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateNote}>Save Changes</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
