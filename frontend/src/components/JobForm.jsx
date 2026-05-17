import { useState } from "react";
import axios from "axios";

function JobForm({ setResults }) {

    const [requiredSkills, setRequiredSkills] = useState("");

    const [minExperience, setMinExperience] = useState(0);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post(

                "https://candidate-shortlisting-backend.onrender.com/api/match",

                {

                    requiredSkills:
                        requiredSkills.split(","),

                    minExperience

                }

            );

            setResults(response.data);

        }
        catch (error) {

            console.log(error);

            alert("Error Matching Candidates");

        }

    };

    return (

        <div>

            <h2>Job Requirement</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="React,Node.js"
                    value={requiredSkills}
                    onChange={(e) =>
                        setRequiredSkills(e.target.value)
                    }
                />

                <br /><br />

                <input
                    type="number"
                    placeholder="Minimum Experience"
                    value={minExperience}
                    onChange={(e) =>
                        setMinExperience(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">

                    Match Candidates

                </button>

            </form>

        </div>

    );

}

export default JobForm;