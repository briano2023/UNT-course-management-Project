// SAMPLE course data. Edit or add courses here (verify against the UNT catalog).
// type: Major Core | Math & Science | University Core | Elective
const COURSES = [
  {code:"CSCE 1030", title:"Computer Science I", credits:3, type:"Major Core"},
  {code:"CSCE 1040", title:"Computer Science II", credits:3, type:"Major Core"},
  {code:"CSCE 2100", title:"Computing Foundations I", credits:3, type:"Major Core"},
  {code:"CSCE 2110", title:"Computing Foundations II", credits:3, type:"Major Core"},
  {code:"CSCE 2610", title:"Assembly Language and Computer Organization", credits:3, type:"Major Core"},
  {code:"CSCE 3110", title:"Data Structures and Algorithms", credits:3, type:"Major Core"},
  {code:"CSCE 3420", title:"Web Application Development", credits:3, type:"Major Core"},
  {code:"CSCE 3600", title:"Principles of Systems Programming", credits:3, type:"Major Core"},
  {code:"CSCE 4000", title:"CSCE Advanced Elective I", credits:3, type:"Elective"},
  {code:"CSCE 4001", title:"CSCE Advanced Elective II", credits:3, type:"Elective"},
  {code:"MATH 1710", title:"Calculus I", credits:4, type:"Math & Science"},
  {code:"MATH 1720", title:"Calculus II", credits:4, type:"Math & Science"},
  {code:"PHYS 1710", title:"Mechanics", credits:4, type:"Math & Science"},
  {code:"SCI 2000", title:"Science Elective", credits:4, type:"Math & Science"},
  {code:"ENGL 1310", title:"College Writing I", credits:3, type:"University Core"},
  {code:"ENGL 1320", title:"College Writing II", credits:3, type:"University Core"},
  {code:"HIST 2610", title:"US History to 1865", credits:3, type:"University Core"},
  {code:"HIST 2620", title:"US History Since 1865", credits:3, type:"University Core"},
  {code:"GOVT 2305", title:"Federal Government", credits:3, type:"University Core"},
  {code:"GOVT 2306", title:"Texas Government", credits:3, type:"University Core"},
  {code:"ART 1000", title:"Creative Arts Course", credits:3, type:"University Core"},
  {code:"PHIL 1000", title:"Language, Philosophy and Culture Course", credits:3, type:"University Core"},
  {code:"ELEC 3000", title:"Free Elective I", credits:3, type:"Elective"},
  {code:"ELEC 3001", title:"Free Elective II", credits:3, type:"Elective"}
];
const SEMESTERS = ["Fall Yr 1","Spring Yr 1","Fall Yr 2","Spring Yr 2","Fall Yr 3","Spring Yr 3","Fall Yr 4","Spring Yr 4"];
const TOTAL_CREDITS = 120;
// Suggested plan: course code -> semester index (0-7)
const SUGGESTED = {
  "CSCE 1030":0,"MATH 1710":0,"ENGL 1310":0,
  "CSCE 1040":1,"MATH 1720":1,"ENGL 1320":1,
  "CSCE 2100":2,"CSCE 2610":2,"PHYS 1710":2,
  "CSCE 2110":3,"HIST 2610":3,"GOVT 2305":3,
  "CSCE 3110":4,"CSCE 3420":4,"SCI 2000":4,
  "CSCE 3600":5,"HIST 2620":5,"GOVT 2306":5,
  "CSCE 4000":6,"ART 1000":6,"ELEC 3000":6,
  "CSCE 4001":7,"PHIL 1000":7,"ELEC 3001":7
};
