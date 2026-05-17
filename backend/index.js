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

const normalizeSkills = (skills = []) => {
    return skills
        .map((skill) => String(skill).trim())
        .filter(Boolean);
};

const normalizeSkill = (skill) => {
    return String(skill).trim().toLowerCase();
};


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

        const body = req.body || {};
        const requiredSkills = normalizeSkills(body.requiredSkills);
        const minExperience = Number(body.minExperience) || 0;
        const requiredSkillSet =
            new Set(requiredSkills.map(normalizeSkill));

        const candidates = await Candidate.find();

        const results = candidates.map(candidate => {

            // Find matched skills
            const matchedSkills = candidate.skills.filter(skill =>
                requiredSkillSet.has(normalizeSkill(skill))
            );

            // Calculate skill score
            const skillScore =
                requiredSkills.length
                    ? matchedSkills.length / requiredSkills.length
                    : 0;

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

        if (!process.env.OPENROUTER_API_KEY) {

            return res.status(500).json({

                success: false,

                message:
                    "OPENROUTER_API_KEY is missing. Add it in Render environment variables."

            });

        }

        const body = req.body || {};
        const requiredSkills = normalizeSkills(body.requiredSkills);
        const minExperience = Number(body.minExperience) || 0;

        // Get candidates
        const candidates = await Candidate.find().lean();

        if (candidates.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "No candidates found. Add candidates before running AI shortlisting."

            });

        }

        // Prompt
        const prompt = `
You are an expert HR recruiter.

Analyze these candidates carefully against the job requirements.

Job Requirements:
Required skills: ${requiredSkills.length ? requiredSkills.join(", ") : "Not provided"}
Minimum experience: ${minExperience} years

Candidates:
${JSON.stringify(candidates, null, 2)}

Tasks:
1. Rank candidates from best to weakest fit
2. Mention matched and missing required skills
3. Consider the minimum experience requirement
4. Explain why each candidate is suitable or not suitable
5. Give one final recommendation
`;

        // API Call
        const response = await axios.post(

            "https://openrouter.ai/api/v1/chat/completions",

            {

                model:
                    process.env.OPENROUTER_MODEL ||
                    "qwen/qwen3-32b:free",

                messages: [
                    {
                        role: "system",
                        content:
                            "Return a concise recruiter-style shortlist with clear rankings."
                    },
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

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        process.env.APP_URL || "http://localhost:5173",

                    "X-Title":
                        "Candidate Shortlisting System"

                },

                timeout: 60000

            }

        );

        // Debug
        console.log(
            JSON.stringify(response.data, null, 2)
        );

        // Safe extraction
        const aiContent =
            response.data?.choices?.[0]?.message?.content;

        // Validation
        if (!aiContent) {

            return res.status(500).json({

                success: false,

                message:
                    "AI returned empty response",

                fullResponse:
                    response.data

            });

        }

        // Success response
        res.json({

            success: true,

            result: aiContent

        });

    }
    catch (error) {

        console.log(
            "AI ERROR:",
            error.response?.data || error.message
        );

        const openRouterError =
            error.response?.data?.error?.message ||
            error.response?.data?.message;

        res.status(500).json({

            success: false,

            message:
                openRouterError || "AI Shortlisting Failed",

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
