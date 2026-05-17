function CandidateList({ results }) {

    return (

        <div>

            <h2>Shortlisted Candidates</h2>

            {
                results.length === 0
                ?
                <p>No Candidates Found</p>
                :
                results.map((candidate, index) => (

                    <div
                        key={index}
                        style={{

                            border: "1px solid gray",
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "10px"

                        }}
                    >

                        <h3>{candidate.name}</h3>

                        <p>
                            <strong>Email:</strong>
                            {candidate.email}
                        </p>

                        <p>
                            <strong>Experience:</strong>
                            {candidate.experience} Years
                        </p>

                        <p>
                            <strong>Skills:</strong>
                            {candidate.skills.join(", ")}
                        </p>

                        <p>
                            <strong>Matched Skills:</strong>
                            {candidate.matchedSkills.join(", ")}
                        </p>

                        <p>
                            <strong>Match Score:</strong>
                            {candidate.matchScore}%
                        </p>

                    </div>

                ))
            }

        </div>

    );

}

export default CandidateList;