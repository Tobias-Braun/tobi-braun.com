export interface ExperienceEntry {
  title: string
  period: string
  icon: string
  description: string
  tags: string[]
  active?: boolean
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Senior Frontend Botanist',
    period: '2021 – Present',
    icon: 'psychiatry',
    description:
      'Architected the core UI ecosystem for a major eco-tech platform. Focused on cultivating accessible, highly tactile web experiences using modern declarative frameworks. Led a team of junior developers in best practices for sustainable code architecture.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    active: true,
  },
  {
    title: 'Fullstack Developer',
    period: '2018 – 2021',
    icon: 'code_blocks',
    description:
      'Developed robust server-side infrastructures that supported delicate, interactive client-side applications. Bridged the gap between raw data models and user-friendly visualizations.',
    tags: ['Node.js', 'PostgreSQL', 'Vue.js'],
  },
  {
    title: 'UI/UX Designer',
    period: '2015 – 2018',
    icon: 'brush',
    description:
      'Began my journey conceptualising interfaces. Focused deeply on human-centred design principles, establishing design systems that prioritised organic spacing and tactile user interactions.',
    tags: ['Figma', 'User Research', 'Prototyping'],
  },
]
