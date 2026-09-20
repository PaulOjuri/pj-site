export interface Testimonial {
  id: string
  name: string
  eventType: string
  date: string
  body: string
  videoSlot: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: 'adaeze-emeka',
    name: 'Adaeze & Emeka Okafor',
    eventType: 'Traditional Igbo Introduction Ceremony & White Wedding',
    date: 'October 2025',
    body: 'Gift understood us before we finished our first sentence. She came into our planning process and immediately saw what we were trying to create — not just a beautiful wedding, but something that honoured both of our families. The introduction ceremony was everything our mothers had imagined and more. On the day itself, I did not think about a single logistical thing. I was just present. That is the greatest gift she gave us.',
    videoSlot: false,
  },
  {
    id: 'tolu-benson',
    name: 'Toluwani Benson',
    eventType: 'Luxury 40th Birthday Gala',
    date: 'March 2025',
    body: 'I told Gift I wanted my 40th to feel like a film premiere and a royal banquet had a child. She took that and ran with it in a way I could not have imagined. The AI renders she showed us at the first design session had me in tears — and then the actual room was even better. Every one of my guests commented on how it felt different. Not just elegant, but intentional. Like someone had thought carefully about every single detail. Someone had.',
    videoSlot: true,
  },
  {
    id: 'chidinma-adeyemi',
    name: 'Chidinma & Adeola Adeyemi',
    eventType: 'Yoruba Traditional Engagement (Introduction)',
    date: 'June 2025',
    body: 'We were planning from abroad and genuinely concerned about how we would manage the coordination across two cities and two families with very strong opinions. Gift was our anchor. She was calm when we were panicked, thorough when we were vague, and somehow always one step ahead of every possible problem. The engagement ceremony was perfection — the colours, the flow, the way she managed the families. Our parents still talk about it.',
    videoSlot: false,
  },
  {
    id: 'blessing-ikenna',
    name: 'Blessing & Ikenna Nwosu',
    eventType: 'Full Yoruba & Igbo Fusion Wedding — Traditional and White',
    date: 'August 2025',
    body: 'We had a complicated brief. Two cultures, three ceremonies, four days, guests flying in from Lagos, Houston, and East London. Gift handled it with a composure I still find remarkable. The 3D walkthrough she did for us two months before the day meant we walked into our reception knowing exactly how it would feel. That knowing changed everything about how relaxed we were. We were dancing before the music even started.',
    videoSlot: true,
  },
  {
    id: 'funmilayo-johnson',
    name: 'Funmilayo Johnson',
    eventType: 'Bridal Shower & Personal Styling',
    date: 'January 2026',
    body: 'I was the maid of honour and came to Gift for help with the bridal shower and my own styling for the traditional ceremony. She has this remarkable ability to listen — truly listen — and then translate what she hears into something you did not even know you wanted. The gele she directed for the ceremony was the most beautiful I have ever worn. Several guests asked if I was also getting married that day.',
    videoSlot: false,
  },
  {
    id: 'ngozi-corporate',
    name: 'Dr Ngozi Eze',
    eventType: 'Annual Charity Gala — Afro-British Health Foundation',
    date: 'November 2025',
    body: 'We have worked with many event companies over the years for our annual gala. None of them understood our audience the way Luxciti did on the very first meeting. Gift grasped immediately what the evening needed to feel like — celebratory but purposeful, elegant but warm, British but deeply rooted in our community. Our most successful gala to date. Three board members asked for her card at the end of the evening.',
    videoSlot: false,
  },
]
