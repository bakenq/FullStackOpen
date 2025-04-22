interface CoursePartBase {
  name: string;
  exerciseCount: number;
}

interface CoursePartDescribedBase extends CoursePartBase {
  description: string;
}

interface CoursePartBasic extends CoursePartDescribedBase {
  kind: "basic";
}

interface CoursePartGroup extends CoursePartBase {
  groupProjectCount: number;
  kind: "group";
}

interface CoursePartBackground extends CoursePartDescribedBase {
  backgroundMaterial: string;
  kind: "background";
}

interface CoursePartSpecial extends CoursePartDescribedBase {
  requirements: string[];
  kind: "special";
}

export type CoursePart =
  | CoursePartBasic
  | CoursePartGroup
  | CoursePartBackground
  | CoursePartSpecial;
