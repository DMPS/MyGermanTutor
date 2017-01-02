var Alexa = require('alexa-sdk');
var _ = require('lodash');

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.0942c425-614a-42de-8abd-56507935e404"
    alexa.dynamoDBTableName = 'MyGermanTutor';
    alexa.registerHandlers(newSessionHandlers, menuHandlers, quizHandlers);
    alexa.execute();
};

var _questionArr = require('./questions.json').questions

var states = {
    MENUMODE: 'MENUMODE',
    QUIZMODE: 'QUIZMODE'
}

var prompts = [
    'I will ask you a question with four possible answers. Option A,B,C, or D. Just tell me the correct letter and I will check it for you. When you are correct, I will increase your score and we will then continue. If you want to take a break please say, Pause. If you want to give up, then please say, Stop.',
    'Thank you for enabling My German Tutor! Would you like to start a new quiz?',
    'Very well then, I shall look forward to your next visit.',
    'Would you like to start a new quiz?',
    'Once you start a quiz, I will ask you multiple choice german grammar questions until you get one wrong. Every one that you get right is a point, and your highscore will be saved at the end. Would you like to start a new quiz?'
]
var repromptText = 'I am sorry, I did not quite catch that. '

//Returns a random question and its answer as an object
function getQuestion(lastQuestion) {
    var questionArr
    if (lastQuestion != -1) { //Makes sure there are no repeat questions
        questionArr = _questionArr.splice(lastQuestion)
    } else {
        questionArr = _questionArr
    }
    var randomNum = _.random(0, questionArr.length-1);
    var questionObj = questionArr[randomNum];
    questionObj.questionNum = randomNum;
    return questionObj
}

//Handles all brand new users
var newSessionHandlers = {
    'NewSession': function () {
        if(this.event.request.intent){
            console.log('has intent')
            if(this.event.request.intent.name==="StartIntent"&&this.attributes.highScore){ //Skip the menu if you say 'start quiz'
                console.log('menu skip')
                this.handler.state = states.QUIZMODE
                this.emitWithState('StartIntent')
            }else{
                this.handler.state = states.MENUMODE
                this.emitWithState('Menu')
            }
        }else{
            this.handler.state = states.MENUMODE
            this.emitWithState('Menu')
        }
    }
}

var menuHandlers = Alexa.CreateStateHandler(states.MENUMODE, {
    'NewSession': function () {
        this.handler.state = ''
        this.emitWithState('NewSession')
    },
    'Menu': function () {
        if (this.attributes.highScore) { //check for new users
            this.emit(':ask', 'Welcome back! Your highscore is ' + this.attributes.highScore.toString() + '. ' + prompts[3], repromptText + prompts[3])
        } else {
            this.attributes.highScore = 0
            this.attributes.sessionCount = 0
            this.emit(':ask', prompts[1], repromptText + prompts[1]);
        }
    },

    'AMAZON.YesIntent': function () {
        this.handler.state = states.QUIZMODE;
        this.emitWithState('StartIntent');
    },

    'AMAZON.NoIntent': function () {
        this.emit(':tell', prompts[2]);
    },
    'AMAZON.HelpIntent':function(){
        this.emit(':ask',prompts[4],repromptText+prompts[4])
    },
    'AMAZON.StopIntent':function(){
        this.emit(':tell',prompts[2])
    },
    'AMAZON.CancelIntent':function(){
        this.emit(':tell',prompts[2])
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes.sessionCount += 1;
        this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },
    'Unhandled': function () {
        this.emit(':ask', repromptText + prompts[3], repromptText + prompts[3]);
    }
});

var quizHandlers = Alexa.CreateStateHandler(states.QUIZMODE, {
    'NewSession': function () {
        this.handler.state = ''
        this.emitWithState('NewSession')
    },

    'StartIntent': function () {
        var question = getQuestion(-1)
        this.attributes.question = question
        this.attributes.score = 0
        this.emit(':ask', 'Your first question, ' + question.text, repromptText + question.text)
    },

    'AnswerIntent': function () {
        var answer = this.event.request.intent.slots.ANSWER.value.toUpperCase() //makes sure that we catch lower case letters
        if (this.attributes.question.answer === answer) { //Checks if they got it right
            var newQuestion = getQuestion(this.attributes.question.questionNum);
            this.attributes.question = newQuestion
            this.attributes.score++
            this.emit(':ask', 'Correct, ' + newQuestion.text, repromptText + newQuestion.text)
        } else {
            this.emitWithState('AMAZON.StopIntent')
        }
    },

    'AMAZON.PauseIntent': function () {
        this.attributes.sessionCount += 1;
        this.emit(':tell', prompts[2]); //Says goodbye to user
        this.handler.state = ''
    },

    'AMAZON.StopIntent': function () {
        this.attributes.sessionCount += 1;
        if (this.attributes.highScore < this.attributes.score) { //Checks if the user beat their highscore and gives them a custom message if they did
            this.attributes.highScore = this.attributes.score //updates highscore
            this.emit(':tell', 'Well done on beating your old high score! Your new high score is ' + this.attributes.highScore + '. I look forward to seeing you top this one!');
        } else {
            var answersOff = this.attributes.highScore - this.attributes.score + 1
            this.emit(':tell', 'You did not quite beat your high score but you were only ' + answersOff + 'off! Better luck next time!')
        }
        this.handler.state = ''
    },
    'AMAZON.CancelIntent':function(){
        this.emitWithState('AMAZON.StopIntent');
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes.sessionCount += 1;
        this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },
    'Unhandled': function () {
        this.emit(':ask', repromptText + this.attributes.question.text, repromptText + this.attributes.question.text); //Asks the user the question again
    }
})