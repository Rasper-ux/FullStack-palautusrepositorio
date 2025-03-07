const Total = ({ course }) => {
    return (
        <p>
            <strong>
                Total of{" "}
                {course.parts.reduce((total, part) => total + part.exercises, 0)}{" "}
                exercises
            </strong>
        </p>
    )
}

export default Total