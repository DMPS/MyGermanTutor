var _ = require('lodash')
var fs = require('fs');

var prompts = [
    'What ending should an adjective take before a ',
    ' noun in the ',
    ' case when preceded by the ',
    " article? Your options are: "
]

var answers = [
    "<say-as interpret-as='spell-out'>en</say-as>",
    "<say-as interpret-as='spell-out'>e</say-as>",
    "<say-as interpret-as='spell-out'>er</say-as>",
    "<say-as interpret-as='spell-out'>es</say-as>",
    "<say-as interpret-as='spell-out'>em</say-as>"    
]

var questions = [
    ['masculine',"nominative",'definite'],
    ['masculine',"nominative",'indefinite'],
    ['masculine',"nominative",'no'],
    ['masculine',"accusative",'definite'],
    ['masculine',"accusative",'indefinite'],
    ['masculine',"accusative",'no'],
    ['masculine',"genitive",'definite'],
    ['masculine',"genitive",'indefinite'],
    ['masculine',"genitive",'no'],
    ['masculine',"dative",'definite'],
    ['masculine',"dative",'indefinite'],
    ['masculine',"dative",'no'],
    ['feminine',"nominative",'definite'],
    ['feminine',"nominative",'indefinite'],
    ['feminine',"nominative",'no'],
    ['feminine',"accusative",'definite'],
    ['feminine',"accusative",'indefinite'],
    ['feminine',"accusative",'no'],
    ['feminine',"genitive",'definite'],
    ['feminine',"genitive",'indefinite'],
    ['feminine',"genitive",'no'],
    ['feminine',"dative",'definite'],
    ['feminine',"dative",'indefinite'],
    ['feminine',"dative",'no'],
    ['neuter',"nominative",'definite'],
    ['neuter',"nominative",'indefinite'],
    ['neuter',"nominative",'no'],
    ['neuter',"accusative",'definite'],
    ['neuter',"accusative",'indefinite'],
    ['neuter',"accusative",'no'],
    ['neuter',"genitive",'definite'],
    ['neuter',"genitive",'indefinite'],
    ['neuter',"genitive",'no'],
    ['neuter',"dative",'definite'],
    ['neuter',"dative",'indefinite'],
    ['neuter',"dative",'no'],
    ['plural',"nominative",'definite'],
    ['plural',"nominative",'indefinite'],
    ['plural',"nominative",'no'],
    ['plural',"accusative",'definite'],
    ['plural',"accusative",'indefinite'],
    ['plural',"accusative",'no'],
    ['plural',"genitive",'definite'],
    ['plural',"genitive",'indefinite'],
    ['plural',"genitive",'no'],
    ['plural',"dative",'definite'],
    ['plural',"dative",'indefinite'],
    ['plural',"dative",'no'],
]
var answersObj = []
var letters = ['A','B','C','D']
function giveRandomAnswers(){
    var answersText = letters.map(function(letter){
        return letter+', '+answers[_.random(4)]
    })
    return answersText.toString()
}

questions.forEach(function(question) {
    var x = {}
    x.text = prompts[0]+question[0]+prompts[1]+question[1]+prompts[2]+question[2]+prompts[3]+giveRandomAnswers()
    x.answer = letters[_.random(3)];
    answersObj.push(x);
}, this);

fs.writeFile('questions.txt',JSON.stringify(answersObj),function(){console.log('Worked')});