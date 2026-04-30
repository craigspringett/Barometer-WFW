import type { TeamMember } from "./types";

export const TEAM: TeamMember[] = [
  {
    id: "luke",
    name: "Luke Carnell",
    firstName: "Luke",
    photo: "/team/luke.svg",
    accent: "#4FC3C5",
  },
  {
    id: "anja",
    name: "Anja Micic",
    firstName: "Anja",
    photo: "/team/anja.svg",
    accent: "#5DCFD0",
  },
  {
    id: "kim",
    name: "Kim Webb",
    firstName: "Kim",
    photo: "/team/kim.svg",
    accent: "#2FA9AB",
  },
  {
    id: "nikki",
    name: "Nikki Webber",
    firstName: "Nikki",
    photo: "/team/nikki.svg",
    accent: "#23898B",
  },
  {
    id: "isobel",
    name: "Isobel Quinton-Holt",
    firstName: "Isobel",
    photo: "/team/isobel.svg",
    accent: "#FF7A59",
  },
];

export function memberById(id: string): TeamMember | undefined {
  return TEAM.find((m) => m.id === id);
}
