const db = require("../models"); 
const Quiz = db.quiz;
const User_Quiz_Scores = db.user_quiz_scores;

exports.getQuizScore = async (req, res) => { 
    let quizId = req.params.quizId; 
    let userId = req.headers["user-id"]; 

    if (!quizId || !userId) { 
        return res.status(400).send({ message: "Ensure userId and quizId are both set!"}); 
    } else if (isNaN(quizId)) { 
        return res.status(400).send({ message: "Please enter a valid quizId!"}); 
    };

    const score = await User_Quiz_Scores.findAll({ where: { userId, quizId }})
    .then((res) => res[0].dataValues.bestScore)
    .catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
    return res.json({ score: score });
};

exports.getAllQuizScores = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    let scores = [];

    await User_Quiz_Scores.findAll({ where: { userId }}).then(async (quizzes) => { 
        for (const quiz of quizzes) {
            const quizId = quiz.dataValues.quizId;
            const bestScore = quiz.dataValues.bestScore;

            scores.push({ quizId: quizId, score: bestScore });
        };
        return res.json(scores);
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};

exports.updateCourseRating = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    let quizId = req.body.quizId; 
    let score = req.body.score;

    if(typeof userId === 'undefined' || typeof quizId === 'undefined' || typeof score === 'undefined') { 
        return res.status(400).send({ message: "Ensure userId, courseId and rating are all set"});
    }

    const previousScore = await User_Quiz_Scores.findAll({ where: { userId, quizId }})
    .then((res) => res[0].dataValues.bestScore); 

    if (parseInt(score) > previousScore) { 
        User_Quiz_Scores.update({ bestScore: score }, { where: { userId, quizId }})
        .then(() => { 
            return res.json({ creditEarned: true });
        }).catch((err) => { 
            return res.status(500).send({ message: err.message });
        })
    } else { 
        return res.json({ creditEarned: false });
    }

}