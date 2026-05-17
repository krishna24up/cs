// ==========================================
// IMPORT REQUIRED PACKAGES
// ==========================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");


// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

// Allows frontend and backend communication
app.use(cors());

// Allows server to read JSON data
app.use(express.json());


// ==========================================
// CONNECT TO MONGODB
// ==========================================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected Successfully");
})
.catch((error) => {
    console.log("MongoDB Connection Error:", error);
});


// ==========================================
// CANDIDATE SCHEMA
// ==========================================

const candidateSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    skills: {
        type: [String],
        required: true
    },

    experience: {
        type: Number,
        required: true
    },

    bio: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


// ==========================================
// CREATE MODEL
// ==========================================

const Candidate = mongoose.model(
    "Candidate",
    candidateSchema
);


// ==========================================
// ROUTE 1
// ADD CANDIDATE
// ==========================================

app.post("/api/candidates", async (req, res) => {

    try {

        const candidate = await Candidate.create(req.body);

        res.status(201).json(candidate);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==========================================
// ROUTE 2
// GET ALL CANDIDATES
// ==========================================

app.get("/api/candidates", async (req, res) => {

    try {

        const candidates = await Candidate.find();

        res.status(200).json(candidates);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==========================================
// ROUTE 3
// BASIC MATCHING
// ==========================================

app.post("/api/match", async (req, res) => {

    try {

        const { requiredSkills, minExperience } = req.body;

        const candidates = await Candidate.find();

        const results = candidates.map(candidate => {

            // Find matched skills
            const matchedSkills = candidate.skills.filter(skill =>
                requiredSkills.includes(skill)
            );

            // Calculate skill score
            const skillScore =
                matchedSkills.length / requiredSkills.length;

            // Experience check
            const experienceScore =
                candidate.experience >= minExperience ? 1 : 0;

            // Final weighted score
            const totalScore =
                (skillScore * 0.8) + (experienceScore * 0.2);

            return {

                name: candidate.name,
                email: candidate.email,
                skills: candidate.skills,
                experience: candidate.experience,
                matchedSkills,

                matchScore:
                    Math.round(totalScore * 100)

            };

        });

        // Sort descending
        results.sort((a, b) =>
            b.matchScore - a.matchScore
        );

        res.json(results);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ==========================================
// ROUTE 4
// AI SHORTLISTING
// ==========================================

app.post("/api/ai/shortlist", async (req, res) => {

    try {

        // Get all candidates
        const candidates = await Candidate.find();

        // Create AI prompt
        const prompt = `
You are an expert HR recruiter.

Analyze these candidates carefully.

Candidates:
${JSON.stringify(candidates, null, 2)}

Tasks:
1. Rank candidates
2. Suggest best candidates
3. Explain why each candidate is suitable
4. Give final recommendation
`;

        // OpenRouter API Call
        const response = await axios.post(

            "https://openrouter.ai/api/v1/chat/completions",

            {
                model: "openrouter/free",

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            },

            {
                headers: {

                    Authorization:
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type": "application/json"

                }
            }

        );

        // Send AI response
        res.json(response.data);

    }
    catch (error) {

        console.log(
            "AI ERROR:",
            error.response?.data || error.message
        );

        res.status(500).json({

            message: "AI Shortlisting Failed",

            error:
                error.response?.data || error.message

        });

    }

});


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.send("Backend Running Successfully");

});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server Running On Port ${PORT}`);

});