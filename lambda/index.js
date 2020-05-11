// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

// Web Scraping npm modules: 
const axios = require('axios');
const cheerio = require('cheerio');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to your spell book! What would you like to know about?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const getSpellInfo = async (handlerInput) => {
    var spell_name = handlerInput.requestEnvelope.request.intent.slots.spell_name.value;
    spell_name = spell_name.split(' ').join('-');
    
    // Source for spell blocks
    var url = 'http://dnd5e.wikidot.com/spell:';
    url = url.concat(spell_name);
    
    var output = [];
    
    await axios.get(url).then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            // var data = [];
            $('p').each(function(i, element) {
                output.push($(element).text());
            });
            console.log("In getSpellInfo/axios and cheerio: "+ output[2])
        }
    });
    
    console.log("In getSpellInfo: "+ output[2])
    return output[2];
}
const Spell_Handler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Spell';
    },
    async handle(handlerInput) {
        // Build spell description for speakOutput
        // getSpellInfo(handlerInput).then((speakOutput) => {
        //     console.log("In Spell_Handler: " + speakOutput);
        //     return handlerInput.responseBuilder
        //         .speak(speakOutput)
        //         .reprompt(speakOutput)
        //         .getResponse();  
        // });
        const speakOutput = await getSpellInfo(handlerInput);
        console.log("In Spell_Handler: " + speakOutput);
        return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();  
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
// const IntentReflectorHandler = {
//     canHandle(handlerInput) {
//         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
//     },
//     handle(handlerInput) {
//         const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
//         const speakOutput = `You just triggered ${intentName}`;

//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
//             .getResponse();
//     }
// };

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        Spell_Handler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        // IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
