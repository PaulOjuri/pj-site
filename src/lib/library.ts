export type Book = {
  title: string
  author: string
  note?: string
}

export type LibraryCategory = {
  id: string
  label: string
  description: string
  books: Book[]
}

export const library: LibraryCategory[] = [
  {
    id: 'ideas',
    label: 'Ideas & Society',
    description: "Books that changed how I think about people, systems, and what's possible.",
    books: [
      {
        title: 'Humankind: A Hopeful History',
        author: 'Rutger Bregman',
        note: "The most persuasive case I've read that humans are fundamentally decent — and that our institutions haven't caught up.",
      },
      {
        title: 'Utopia for Realists',
        author: 'Rutger Bregman',
        note: 'Universal basic income, the 15-hour work week, open borders. Bregman makes the radical feel inevitable.',
      },
      {
        title: 'Prosperity',
        author: 'Colin Mayer',
        note: 'What corporations are actually for, and how they could be redesigned to serve people rather than just shareholders.',
      },
    ],
  },
  {
    id: 'fiction',
    label: 'Fiction',
    description: "Novels I've read and ones on the to-read pile. Mostly thrillers and crime.",
    books: [
      {
        title: 'Inferno',
        author: 'Dan Brown',
        note: 'Overpopulation as the villain. Fast, propulsive, infuriating in the best way.',
      },
      {
        title: 'A Question of Blood',
        author: 'Ian Rankin',
        note: 'Rebus at his most complicated. Rankin writes Edinburgh the way Chandler wrote LA.',
      },
      {
        title: 'Roots',
        author: 'Alex Haley',
        note: 'One of the most important novels written in English. Haley traced his lineage back seven generations to The Gambia.',
      },
      {
        title: 'One Head Too Many',
        author: 'Christopher Brookmyre',
        note: "Brookmyre's Scotland is darkly funny in a way that sneaks up on you.",
      },
    ],
  },
  {
    id: 'history',
    label: 'History & Conflict',
    description: 'Mostly 20th century — war, intelligence, and the machinery of states.',
    books: [
      {
        title: 'The Secret War',
        author: 'Max Hastings',
        note: 'Intelligence in World War II — signals, deception, and the people who ran both. Meticulously researched.',
      },
      {
        title: 'The Secret War with Germany',
        author: 'David Kahn',
        note: 'Espionage, disinformation, and the quiet battles fought away from any front line.',
      },
      {
        title: 'Unholy War',
        author: 'John L. Esposito',
        note: 'A serious, non-polemical account of political Islam and how the West keeps misreading it.',
      },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership & Business',
    description: 'The ones that earned their place by being specific, not by being motivational.',
    books: [
      {
        title: 'The 8th Habit',
        author: 'Stephen R. Covey',
        note: 'Beyond effectiveness to meaning. Where the 7 Habits ends, this begins.',
      },
      {
        title: 'Pour Your Heart Into It',
        author: 'Howard Schultz',
        note: 'The Starbucks origin story — more honest about failure than most founder memoirs.',
      },
      {
        title: 'Experiencing LeaderShift',
        author: 'Don Cousins',
        note: 'On the transition from leading through position to leading through influence.',
      },
    ],
  },
  {
    id: 'music',
    label: 'Music',
    description: 'Jazz lives here.',
    books: [
      {
        title: 'Jazz Singing',
        author: 'Will Friedwald',
        note: 'The definitive guide to jazz vocals — Ella, Billie, Sinatra, and everyone they influenced. Dense and wonderful.',
      },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    description: 'Things I reach for, not read cover to cover.',
    books: [
      {
        title: 'Visual Dictionary',
        author: 'DK',
        note: 'Every object, labelled. Indispensable for writing precisely about things.',
      },
      {
        title: '101 Chess Endgame Tips',
        author: 'Steve Giddins',
        note: "Chess taught me how to think about positions that look equivalent but aren't. Endgames especially.",
      },
    ],
  },
]
