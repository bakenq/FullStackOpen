const Header = ({ course }) => {
    return (
        <h2>{course}</h2>
    )
}

const Content = ({ parts }) => {
    return (
        <div>
            {parts.map(part =>
                <Part key={part.id} part={part} />
            )}
        </div>
    )
}

const Part = ({ part }) => {
    return (
        <p>{part.name} {part.exercises}</p>
    )
}

const Total = ({ parts }) => {
    const totalExercises = parts.reduce((sum, part) => {
        //console.log('reduce:', sum, part)
        return sum + part.exercises
    }, 0)

    return (
        <p>
            <b>total of {totalExercises} exercises</b>
        </p>
    )
}

const Course = ({ course }) => {
    return (
        <div>
            <Header course={course.name} />
            <Content parts={course.parts} />
            <Total parts={course.parts} />
        </div>
    )
}

export default Course