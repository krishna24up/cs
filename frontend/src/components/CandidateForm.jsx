import { useState } from "react";
import axios from "axios";

function CandidateForm() {

    // React State
    const [formData, setFormData] = useState({

        name: "",
        email: "",
        skills: "",
        experience: "",
        bio: ""

    });

    // Handle Input Change
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    // Handle Form Submit
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // Convert skills string to array
            const payload = {

                ...formData,

                skills: formData.skills.split(",")

            };

            // Send data to backend
            await axios.post(

                "https://cs-nlac.onrender.com/api/candidates",

                payload

            );

            alert("Candidate Added Successfully");

        }
        catch (error) {

            console.log(error);

            alert("Error Adding Candidate");

        }

    };

    return (

        <div>

            <h2>Add Candidate</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="skills"
                    placeholder="React,Node.js,MongoDB"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="experience"
                    placeholder="Experience"
                    onChange={handleChange}
                />

                <br /><br />

                <textarea
                    name="bio"
                    placeholder="Enter Bio"
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">

                    Add Candidate

                </button>

            </form>

        </div>

    );

}

export default CandidateForm;