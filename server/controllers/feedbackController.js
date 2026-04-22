import Feedback from "../models/feedback.js"

export async function createFeedback(req, res) {
    try {
        const { rating, comment } = req.body

        if (!rating || !comment) {
            res.status(400).json({ message: "Rating and comment are required" })
            return
        }

        const newFeedback = new Feedback({
            rating,
            comment,
            userId: req.body.userId || "anonymous"
        })

        await newFeedback.save()
        res.status(201).json({
            message: "Feedback created successfully",
            feedback: newFeedback
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating feedback",
            error: error.message
        })
    }
}

export async function getAllFeedback(req, res) {
    try {
        const feedback = await Feedback.find()
        res.status(200).json(feedback)
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving feedback",
            error: error.message
        })
    }
}
