export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    title: "Google I/O 2026",
    image: "/images/event1.png",
    slug: "google-io-2026",
    location: "Shoreline Amphitheatre, Mountain View, CA",
    date: "May 20, 2026",
    time: "10:00 AM PDT",
  },
  {
    title: "GitHub Universe 2026",
    image: "/images/event2.png",
    slug: "github-universe-2026",
    location: "Bill Graham Civic Auditorium, San Francisco, CA",
    date: "October 28, 2026",
    time: "9:00 AM PDT",
  },
  {
    title: "React Summit 2026",
    image: "/images/event3.png",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands",
    date: "June 12, 2026",
    time: "9:30 AM CEST",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event4.png",
    slug: "aws-reinvent-2026",
    location: "The Venetian, Las Vegas, NV",
    date: "December 1, 2026",
    time: "8:00 AM PST",
  },
  {
    title: "HackMIT 2026",
    image: "/images/event5.png",
    slug: "hackmit-2026",
    location: "MIT Campus, Cambridge, MA",
    date: "September 19, 2026",
    time: "10:00 AM EDT",
  },
  {
    title: "ViteConf 2026",
    image: "/images/event6.png",
    slug: "viteconf-2026",
    location: "Online",
    date: "October 9, 2026",
    time: "12:00 PM CEST",
  },
];
