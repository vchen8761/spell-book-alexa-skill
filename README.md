## Alexa Skill for D&D 5E Spells
This skill allows you to ask Alexa about D&D 5E spell descriptions by scraping
Wikidot articles for the appropriate information.

## Motivation
Sometimes when I am brainstorming about encounters or character creation, a
spell name comes to mind, but I do not know its specifics. Although my computer
or smartphone may not be within reach, Alexa can hear me easily. Thus, I have
created an Alexa skill to describe spells to me. 

## Build status
n/a (Not integrated with Travis CI yet)

## Tech/framework used
- Javascript
- Node.js
- Axios
- Cheerio


<b>Built with</b>
- [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)

## Features
Handles all published and Unearthed Arcana spells in D&D 5E. Also handles a
myriad of intents by representing spell names as slots.

## Code Example
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

## Installation and How to use?
This Alexa skill was made for private use and to learn more about app
developement. Feel free to reproduce the skill for your own use but please do not
publish it.

## API Reference
https://cheerio.js.org/
https://www.npmjs.com/package/axios

## Credits
Thanks to @Dan O for linking me to a Stack Overflow thread on Promise Callbacks
Thanks to @Dylan Sather for his Medium article on web scraping (https://medium.com/@dylan.sather/scrape-a-site-with-node-and-cheerio-in-5-minutes-4617daee3384)

