var Alexa = require('alexa-sdk');
var _ = require('lodash');

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.0942c425-614a-42de-8abd-56507935e404"
    alexa.dynamoDBTableName = 'MyGermanTutor';
    alexa.registerHandlers(newSessionHandlers,menuHandlers,quizHandlers);
    alexa.execute();
};

var _questionArr = [
    {
        text:'Blah the Blah? A, en. B, cd',
        answer:'B'
    }
]

var states = {
    MENUMODE: 'MENUMODE',
    QUIZMODE: 'QUIZMODE'
}

var prompts = [
    'I will ask you a question with four possible answers. Option A,B,C, or D. Just tell me the correct letter and I will check it for you. When you are correct, I will increase your score and we will then continue. If you want to take a break please say, Pause. If you want to give up, then please say, Stop.',
    'Thank you for enabling My German Tutor! Would you like to start a new quiz?',//Add more on tutorial
    'Alright, see you later!',
    'Would you like to start a new quiz?'
]
var repromptText = 'I am sorry, I did not quite catch that.'

//Returns a random question and its answer as an object
function getQuestion(lastQuestion) {
    if (lastQuestion != -1) { //Makes sure there are no repeat questions
        var questionArr = _questionArr.splice(lastQuestion)
    } else {
        var questionArr = _questionArr
    }
    var randomNum = _.random(0,_questionArr.length);
    var questionObj = _questionArr[randomNum];
    questionObj.questionNum = randomNum;
    return questionObj
}

//Handles all brand new users
var newSessionHandlers = {
    'NewSession': function () {
        this.handler.state = states.MENUMODE
        this.emitWithState('Menu')
    }
}

var menuHandlers = Alexa.CreateStateHandler(states.MENUMODE, {
    'Menu': function () {
        if (this.attributes.highScore) { //check for new users
            this.emit(':ask', 'Welcome back! Your highscore is ' + this.attributes.highScore.toString() + '. '+prompts[3])
        } else {
            this.emit(':ask',prompts[1]);
        }
    },
    'AMAZON.YesIntent': function () {
        this.handler.state = states.QUIZMODE;
        this.emitWithState('StartIntent');
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tell', prompts[2]);
    },
    'Unhandled': function () {
        this.emit(':ask', repromptText + prompts[3]);
    }
});

var quizHandlers = Alexa.CreateStateHandler(states.QUIZMODE, {
    'NewSession':function(){
        this.emitWithState('StartIntent')
    },
    'StartIntent': function () {
        var question = getQuestion(-1)
        this.attributes.question = question
        this.attributes.score = 0
        this.emit(':ask', 'Your first question, ' + question.text)
    },
    'AnswerIntent': function () {
        var answer = this.event.request.intent.slots.ANSWER.value
        if(this.attributes.question.answer===answer){
            var newQuestion = getQuestion(this.attributes.question.questionNum);
            this.attributes.score++
            this.emit(':ask', 'Correct, ' + newQuestion.text)
        }
    },
    'AMAZON.PauseIntent': function () {
        this.emit(':tell',prompts[2]); //Says goodbye to user
        this.handler.state = ''
    },
    'AMAZON.StopIntent': function () {
        if(this.attributes.highScore<this.attributes.score){ //Checks if the user beat their highscore and gives them a custom message if they did
            this.attributes.highScore = this.attributes.score //updates highscore
            this.emit(':tell','Well done on beating your old high score! Your new high score is '+this.attributes.highScore+'I look forward to seeing you top this one!');
        }else{
            var answersOff = this.attributes.highScore-this.attributes.score+1
            this.emit(':tell','You did not quite beat your high score but you were only '+answersOff+'off! Better luck next time!')
        }
        this.handler.state = ''
    },
    'Unhandled': function () {
        this.emit(':ask',repromptText+this.attributes.question.text); //Asks the user the question again
    }
})