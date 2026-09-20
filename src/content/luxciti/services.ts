export interface Service {
  id: string
  title: string
  price: string
  feeling: string
  description: string
  includes: string
  forWhom: string
  anchor: string
}

export interface Enhancement {
  name: string
  price: string
}

export const services: Service[] = [
  {
    id: 'full-luxury',
    title: 'Full Luxury Production',
    price: '£10,000',
    feeling: 'From the first sketch to the final dance — every detail, beautifully seen to.',
    description:
      'Our most complete offering. Gift and her team take full creative and operational ownership of your celebration, from concept to confetti. You experience the planning process as a client, never a coordinator.',
    includes:
      'Venue sourcing and negotiation, AI design renders, 3D walkthrough, full vendor management, bespoke timeline, on-the-day coordination, honeymoon handover.',
    forWhom:
      'Couples and families who want a truly hands-off, full-service experience with no detail left to chance.',
    anchor: 'full-luxury',
  },
  {
    id: 'signature',
    title: 'Signature Coordination',
    price: '£6,000',
    feeling: 'Your vision, amplified. Our expertise, behind every decision.',
    description:
      'For couples who have ideas and suppliers in place but need a seasoned creative director to bring it all to life with precision and cultural intelligence.',
    includes:
      'Design consultation and refinement, AI renders for key styling moments, vendor coordination, full timeline management, on-the-day direction.',
    forWhom:
      'Couples who are part-way through planning and want a brilliant collaborator to elevate and execute.',
    anchor: 'signature',
  },
  {
    id: 'hybrid',
    title: 'Hybrid Coordination',
    price: '£4,000',
    feeling: 'The planning joy, with professional hands on the detail.',
    description:
      'A beautifully balanced partnership — you lead the creative journey, Gift steps in to coordinate vendors, build the master timeline, and run the day flawlessly.',
    includes:
      'Four planning consultations, vendor liaison, detailed timeline, on-the-day coordination for up to 12 hours.',
    forWhom:
      'Organised couples who love the planning process and want expert on-the-day assurance.',
    anchor: 'hybrid',
  },
  {
    id: 'day-of',
    title: 'Day-Of Management',
    price: '£2,500',
    feeling: 'Wake up as a guest at your own celebration.',
    description:
      'Handed over to us four weeks before your wedding. We take your plans, build the operational manifesto, brief every supplier, and run the day with the same precision we bring to our full-service clients.',
    includes:
      'Supplier confirmation calls, master timeline, 10 hours on-the-day management, emergency kit, post-event briefing.',
    forWhom: 'Self-planned couples who want a professional at the helm on the day itself.',
    anchor: 'day-of',
  },
  {
    id: 'honeymoon',
    title: 'Honeymoon Curation',
    price: '£500',
    feeling: 'Your story continues. Every suite, every sunrise, already chosen.',
    description:
      'Bespoke honeymoon itinerary design based on your personalities, travel style and the feeling you want to carry from your wedding day into your first days of marriage.',
    includes:
      'Destination consultation, curated itinerary, hotel and experience recommendations, packing guide.',
    forWhom:
      'Newly married couples who want a honeymoon that feels as intentional as their wedding.',
    anchor: 'honeymoon',
  },
  {
    id: 'first-home',
    title: 'First Home Sourcing',
    price: 'By consultation',
    feeling: 'A home that already feels like yours, before you move in.',
    description:
      'Interior sourcing and lifestyle design service to help newly-wed couples create a first home that reflects who they are together.',
    includes:
      'Style consultation, mood boarding, furniture and décor sourcing, supplier introductions.',
    forWhom:
      'Couples setting up their first home together who want it to feel intentional from day one.',
    anchor: 'first-home',
  },
  {
    id: 'styling',
    title: 'Personal & Party Styling',
    price: 'From £500',
    feeling: 'Walk into every room knowing you are exactly who you meant to be.',
    description:
      "Personal styling for life's milestone moments — your engagement shoot, introduction ceremony, bridal shower, or simply the event that calls for your most beautiful self.",
    includes:
      'Style consultation, outfit direction, gele tying for traditional ceremonies, accessories curation.',
    forWhom: 'Women who want to feel utterly themselves, at their most radiant.',
    anchor: 'styling',
  },
  {
    id: 'girls-trips',
    title: "Girls' Trips & Luxury Weekends",
    price: 'From £1,500',
    feeling: 'The group trip everyone talks about for years.',
    description:
      'From Lagos to Lake Como, bespoke group travel experiences designed around your friendship, your energy, and your appetite for the extraordinary.',
    includes:
      'Destination curation, itinerary design, accommodation and dining bookings, airport coordination, on-trip support.',
    forWhom:
      "Bridesmaids and friend groups who want more than a standard hen do — something that actually feels like them.",
    anchor: 'girls-trips',
  },
  {
    id: 'corporate',
    title: 'Corporate Events',
    price: 'From £3,000',
    feeling: 'Your brand, experienced. Not just attended.',
    description:
      'Corporate galas, networking dinners, team celebrations and brand activations produced with the same cultural sensitivity and creative intelligence we bring to our private clients.',
    includes:
      'Venue sourcing, full event production, catering coordination, AV management, run-of-show, post-event reporting.',
    forWhom: 'Companies and organisations who want their events to create lasting impressions.',
    anchor: 'corporate',
  },
  {
    id: 'community',
    title: 'Community & Cultural Events',
    price: 'By consultation',
    feeling: 'Culture celebrated with the dignity and joy it deserves.',
    description:
      'Charities, community organisations and cultural institutions trust us to produce events that honour their audiences with warmth, precision and cultural pride.',
    includes: 'Full event production scaled to your budget and vision.',
    forWhom:
      'Community leaders, nonprofits, and cultural organisations in the British-African space.',
    anchor: 'community',
  },
]

export const enhancements: Enhancement[] = [
  { name: 'EA Team of 4', price: '£800' },
  { name: 'EA Team of 6', price: '£1,200' },
  { name: 'AI Event Design Renders', price: '£300–£800' },
  { name: 'Immersive 3D Venue Walkthrough', price: '£500–£1,500' },
  { name: 'Vendor Sourcing & Negotiation', price: '£300–£600' },
  { name: 'Post-Event Report & Vendor Debrief', price: '£250' },
]
