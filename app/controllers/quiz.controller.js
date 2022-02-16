const db = require("../models"); 
const Credit = db.credit;
const User_Quiz_Scores = db.user_quiz_scores;

// get quiz (best)score for user 
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

// get list of all quiz scores for user
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

// update quiz score
// note that only the best score for a user is saved
exports.updateQuizScore = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    let quizId = req.body.quizId; 
    let score = req.body.score;

    // ensure all variables are set and defined
    if(typeof userId === 'undefined' || typeof quizId === 'undefined' || typeof score === 'undefined') { 
        return res.status(400).send({ message: "Ensure userId, quizId and rating are all set"});
    } else if (isNaN(quizId) || isNaN(score)) { 
        return res.status(400).send({ message: "Please enter a valid quizId or score!"}); 
    };

    const previousScore = await User_Quiz_Scores.findAll({ where: { userId, quizId }})
    .then((res) => res[0].dataValues.bestScore); 

    // only update table if score is greater than previous score
    if (parseInt(score) > previousScore) { 
        User_Quiz_Scores.update({ bestScore: score }, { where: { userId, quizId }})
        .catch((err) => { 
            return res.status(500).send({ message: err.message });
        })
    } 

    // all quiz scores intitially set to -1 for each quiz
    // can only earn credit for successfully completing quiz for time 
    if (parseInt(previousScore) === -1) { 
        // first time completion = credit earned
        Credit.increment('credits', { by: 1, where: { userId: userId }});
        return res.json({ creditEarned: true });
    } else { 
        return res.json({ creditEarned: false })
    }
}