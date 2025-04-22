import { CoursePart } from "../types";

type PartProps = {
  part: CoursePart;
};

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

const Part = ({ part }: PartProps) => {
  switch (part.kind) {
    case "basic":
      return (
        <div>
          <p>
            <b>
              {part.name} {part.exerciseCount}
            </b>
          </p>
          <p>
            <i>{part.description}</i>
          </p>
        </div>
      );
    case "group":
      return (
        <div>
          <p>
            <b>
              {part.name} {part.exerciseCount}
            </b>
          </p>
          <p>
            <i>Project exercises: {part.groupProjectCount}</i>
          </p>
        </div>
      );
    case "background":
      return (
        <div>
          <p>
            <b>
              {part.name} {part.exerciseCount}
            </b>
          </p>
          <p>
            <i>{part.description}</i>
          </p>
          <p>Background Material: {part.backgroundMaterial}</p>
        </div>
      );
    case "special":
      return (
        <div>
          <p>
            <b>
              {part.name} {part.exerciseCount}
            </b>
          </p>
          <p>
            <i>{part.description}</i>
          </p>
          <p>Requierments: {part.requirements}</p>
        </div>
      );
    default:
      return assertNever(part);
  }
};

export default Part;
