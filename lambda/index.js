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
        const speakOutput = 'Welcome to your spell book! What spell would you like to learn about?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Helper Function for handling web scraping
const getSpellInfo = async (handlerInput) => {
    
    // Get spell_name value from intent slots
    var spell_name = handlerInput.requestEnvelope.request.intent.slots.spell_name.value;
    // Split spell name by '-' for wikidot url format
    spell_name = spell_name.split(' ').join('-');
    
    // Source for spell blocks
    var url = 'http://dnd5e.wikidot.com/spell:';
    // Concatenate hypenated spell name to url for query
    url = url.concat(spell_name);
    
    // Spell information from web scraping wikidot
    var spell_description = [];
    
    // Use await to run code synchronously 
    // Use Axios to get HTML DOM 
    await axios.get(url).then((response) => {
        // If url status code is OK / Website reached OK
        if(response.status === 200) {
            // Grab data and load it into cheerio parser
            const html = response.data;
            const $ = cheerio.load(html);
            
            // Search each description tag for its text
            // This works since wikidot uses static pages
            $('p').each(function(i, element) {
                spell_description.push($(element).text());
            });
        }
    });
    
    console.log(spell_description);
    var outputText = spell_name + " is a " + spell_description[0] + ". ";
    
    for(var i = 2;  i < spell_description.length - 1; i++){
        outputText += spell_description[i] + " ";
    }
    
    outputText += "The spell has a " + spell_description[1] + ". ";
    outputText += "The spell is found in the following " + spell_description[spell_description.length - 1] + ".";
    
    // Outputs appropriate spell description
    return outputText;
}
const Spell_Handler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Spell';
    },
    // Make async so that we can use await keywork and 
    // wait for external API call
    // in this case: Axios and Cheerio
    async handle(handlerInput) {
        // Return description of spell for Alexa to repeat aloud
        const speakOutput = await getSpellInfo(handlerInput);
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
        const speakOutput = 'You can ask me to describe fantasy spells. Try saying: Describe Fireball';

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
