export interface Journey {
  code: string;
  title: string;
  author: string;
  description: string;
  category: string;
  isWaitlist: boolean;
}

export const journeys: Journey[] = [
  {
    code: "#45",
    title: "How to Build a Startup",
    author: "Mike McGuiness",
    description:
      "Daily ideas from people who have actually built things, not just talked about them. Focused on early-stage founders navigating the chaos of getting to product market fit.",
    category: "Entrepreneurship",
    isWaitlist: false,
  },
  {
    code: "#77",
    title: "Thought Triggering Thoughts",
    author: "Orange Book",
    description:
      "Short, sharp reflections that stick in your head all day. Built for people who like to think deeply about freedom, work, money and the internet.",
    category: "Leadership",
    isWaitlist: false,
  },
  {
    code: "#82",
    title: "Learn from History's Greatest Entrepreneurs",
    author: "David Senra (Founders Podcast)",
    description:
      "Lessons, patterns and cautionary tales from the lives of iconic builders, delivered as tiny stories you can read between meetings.",
    category: "Entrepreneurship",
    isWaitlist: false,
  },
  {
    code: "#120",
    title: "The Hidden Logic of African Markets",
    author: "Bright Simons",
    description:
      "A clear-eyed look at how African markets actually work — incentives, workarounds, power, and the systems beneath the surface.",
    category: "Marketing",
    isWaitlist: false,
  },
  {
    code: "",
    title: "Mastering Business and Self",
    author: "Vusi Thembekwayo",
    description:
      "A practical, no-sugar-coating journey on building both the business and the person running it, covering leadership, discipline and execution.",
    category: "Leadership",
    isWaitlist: true,
  },
  {
    code: "",
    title: "How to Build a Fundable Startup",
    author: "Maya Horgan",
    description:
      "Demystifying fundraising from the investor side of the table, what gets attention, what kills deals and how to prepare like a pro.",
    category: "Entrepreneurship",
    isWaitlist: true,
  },
  {
    code: "",
    title: "Principles",
    author: "Ray Dalio",
    description:
      "A principles-first way to make decisions, handle setbacks and think in systems, adapted into daily prompts.",
    category: "Leadership",
    isWaitlist: true,
  },
  {
    code: "",
    title: "How to Build with Purpose",
    author: "Strive Masiyiwa",
    description:
      "Stories and ideas on building enduring, values-led companies that serve communities, not just quarterly targets.",
    category: "Leadership",
    isWaitlist: true,
  },
  {
    code: "",
    title: "Stories from Africa's Builders",
    author: "The Afropolitan Podcast",
    description:
      "Unheard conversations with Africa's leading entrepreneurs on ambition, execution, and building in complex markets.",
    category: "Marketing",
    isWaitlist: true,
  },
];

export const categories = ["All", "Entrepreneurship", "Leadership", "Tech", "Marketing"];
