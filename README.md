Javascript Chatbot
==================

A chatbot 'library' that makes it easy to develop chatbots that respond to users commands. It's still a work in progress, so expect more features to come soon.

Setting up Javascript Chatbot
-----------------------------

Chatbot requires [jQuery](https://jquery.com/) as a dependency. To use a bot, first import the `bots.js` file, and then the bot. After this, you will be able to use Javascript Chatbot.

A version of Chatbot for NodeJS is currently not available, but will be soon.

Creating a Chatbot
------------------

Each chatbot should live in its own Javascript file, with the name of the chatbot as the file name.  
To add a chatbot, use the `Bots.push()` function:

    Bots.push({
        "name": "[Bot name]",
        "precatch": function(text) {
            return text;
        },
        "actions": [],
        "postcatch": function(text) {
            return text;
        },
        
        "functions": {},
        "synonyms": [],
        "variables": {}
    });

Only the `name` property is required. All of the other properties default to the ones below.

** How it Works **

To understand how to create a working bot, you should first understand the basic pieces.

When a message is sent to the chatbot, the `precatch(text)` function is first called with the first parameter as the message. The return value of this function is then used for the rest of the processing. *You must return something from this function, or else you will end up with an error*!

After the `precatch()` function is called, the bot system will then process the bots actions. These are contained in the `actions` property, and should look something like this:

    "actions": [
        {
            "catch": ["hello"],
            "response": "Hello!"
        },
        {
            "catch": ["*how are you*"],
            "response": [
                "I'm good thanks! What about you?",
                "Um.. alright, I guess.",
                "I don't feel well."
            ]
        }
    ]

The bot system will look through each of these objects in the `actions` array to find one that matches. If one matches, it will then call the `postcatch()` function and output the value (more on this later). The chatbot system finds a match using the `catch` parameter. It is case *and* punctuation insensitive. Wildcards can also be used with an asterisk (`*`). If the `catch` contains multiple elements in the array, then all will be checked, and if one or more matches, the response will be taken.

In the case shown above, if the user enters `hello` in any case or with any punctuation, the chatbot will output `Hello!`, as this is what is specified in the `response` property. However, if the user enters some text including `how are you` (because of the asterisk before and after), the chatbot will output one of the responses, picked randomly.

Catches can also contain a `from` property, which will prevent the catch from matching unless the user is the user specified. The `from` property can also contain wildcards.

Responses can contain more than just response text, howevever. The chatbot system allows you to specify actions to take the next time a message is received by the chatbot:

    "actions": [
        {
            "catch": ["how are you*"],
            "response": [
                {
                    "text": "I'm good thanks! What about you?",
                    "actions": [
                        {
                            "catch": ["*good*"],
                            "response": "That's good!",
                            "from": "{PREVIOUS}"
                        },
                        {
                            "catch": ["*ok*"],
                            "response": "Oh, ok.",
                            "from": "{PREVIOUS}"
                        },
                        {
                            "catch": ["*bad*],
                            "response": "That's too bad.",
                            "from": "{PREVIOUS}"
                        },
                        {
                            "catch": ["*"],
                            "response": "ANSWER ME!",
                            "from": "{PREVIOUS}"
                        }
                    ]
                }
            ]
        },
        {
            "catch": ["*hello*"],
            "response": "Hello!"
        }
    ]

For now, let's just assume that setting `from` to `{PREVIOUS}` will mean that the action only responds to the person who initated the last response. A conversation using this code would look like this:

    User > hello there!
    Chat > Hello!                             // Responds to the catch in the original stream
    User > how are you?
    Chat > I'm good thanks! What about you?   // Initiates a new stream branching from the original one
    User > hello again
    Chat > ANSWER ME!                         // Responds from the new stream, rather than the original one
    User > hello again!
    Chat > Hello!                             // The previous stream has finished, so we go back to the original
    User > how are you?
    Chat > I'm good thanks! What about you?   // Entering the new stream again
    User > I'm good thanks
    Chat > That's good!                       // A response from the new stream
    User > hello
    Chat > Hello!                             // The previous stream has, again, finished, so we go back to the original

As you can see, if a match is found in the current 'stream', the chatbot system will not fallback to the previous stream (in this case, when the user says `hello again` after saying `how are you?`, which matches the wildcard in the `how are you?` response stream).

**Understanding Streams**

The chatbot system uses a special 'streaming' system which allows it to understand which catch set it should process. The image below demonstrates this streaming by using the above code as an example:
<img src="http://i.imgur.com/K5hsmMS.png" />

After the bots trigger for `how are you*` is triggered, a new stream is created containing a new set of responses. Each of these responses will break out of the stream, and if none of the responses match, then the system will go back and see if any responses from previous streams match. In this case, this will never happen because a 'default' match has been provided at the end of the second stream.

You can re-use streams by defining `functions`. These are contained in the `functions` property of the bot. The key of the item in the `functions` object is the name of the function, and the value should be an array containing the catches. You can specify to use a certain function in a catch like the following:

    {
        "catch": "how are you*",
        "response": [
            {
                "text": "I'm good!",
                "actions": "MYFUNCTION"
            }
        ]
    }

As you can see, by specifying a non-array in the `actions` you can use a function, which you can also use in other catches. This can also be used to achieve a loop:

    "functions": {
        "MYFUNCTION": [
            {
                "text": "hello*",
                "response": [{
                    "text": "Hello!!",
                    "actions": "MYFUNCTION"
                }]
            },
            {
                "text": "what*",
                "response": [{
                    "text": "That's a good question",
                    "actions": "MYFUNCTION"
                }]
            }
        ]
    }

This will cause `MYFUNCTION` to loop *if* the message matches either `hello*` or `what*`. Otherwise, it will fall back to the previous stream.

**Using Synonyms**

Synonyms allow you to test for words where the user could enter similar words. Synonyms also allow you to give semi-random responses that look unique every time.

A list of synonyms should be contained in the `synonyms` property of the bot object. It should be structured like this:

    "synonyms": [
        ["hello", "hi", "howdy"],
        ["goodbye", "bye", "see you"]
    ]

In a catch, you can specify if a word should allow synonym variations by surrounding the word with carrots (`^`).. For example, using the synonym list above, the following would all work for the catch `^hello^ there!`...

- `hello there!`
- `hi there!`
- `howdy there!`

You can also put in multiple synonym variations in the one catch. For example, the following would all work for the catch `^hello^ and ^goodbye^`...

- `hello and goodbye`
- `hello and bye`
- `hello and see you`
- `hi and goodbye`
- `hi and bye`
- `hi and see you`
- `howdy and goodbye`
- `howdy and bye`
- `howdy and see you`

Additionally, synonyms can also be used in responses to give random-ish responses... For example, the response `^goodbye^ now!` could output either:

- `goodbye now!`
- `bye now!`
- `see you now!`

**Using Variables**

Variables allow you to store and re-use pieces of information. In text, you can use a variable with curly brackets surrounding the name of the variable. For example, if there is a variable called `BOT` which was equal to `MyBot`, using the response `Hello from {BOT}` would output `Hello from MyBot`. The bot system also comes with a list of predefined variables:

- `{USER}` - The user who sent the message
- `{PREVIOUS}` - The user who sent the previous message (for use in streams)
- `{BOT}` - The name of the current bot

You can define custom variables in the `variables` property of the bot object. To return dynamic contents, the variables can be functions:

    "variables": {
        "TIME": function(bot) {
            return (new Date()).toString();
        },
        "MYVARIABLE": "myvalue"
    }

If the variable is a function, the bot is passed in as the first parameter, and the value of the variable should be returned.

To allow user input from variables, you can also use input clauses in your catches. These look like this:

    {
        "catch": ["*name is {=NAME}"],
        "response": ["Hello, {NAME}"]
    }

By placing an equal sign (`=`) before the variable name, the value placed in the message where that statement is will be placed into the variable. When comparing messages and catches, these input clauses evalutate to a wildcard.

**Important Note** Input clauses can return strange results if surrounded by wildcards. An input clause can only use the information directly around it until the next asteriskes on either side to track which piece of information to grab and place into the variable, and as such can return incorrect results. *Using multiple input clauses in a catch can sometimes work, but is generally not recommended.*

Variables can also be gotten or set in the `precatch`, `postcatch`, or other variable functions using the bots `.getVariable("variable name")` or `.setVariable("variable name", "new value")` functions. In `precatch` and `postcatch` the bot is accessible through `this`.

** Postcatches **
The post catch function, which you can set with the `postcatch` property of the bot object, allows you to do extra processing of the text before it is outputted. The format for this is the same as `precatch`. The input text comes in, and you should return the output text.

Note: variables are processed before *and* after the `postcatch` function is called, meaning that the `postcatch` function *can* return variables in text.

Using the Chatbot System
------------------------

Now that we know how to *create* a chatbot, let's find out how to load that chatbot and use it. All of these functions exist in the `Bots` object.

Once a bot has been added, it's object can be gotten using `Bots.find("name of bot")`. *The name is case-insensitive.* This function returns a bot object which contains the above properties, as well as some added ones:

- `.setVariable(name, value)` allows you to set a variable for the bot
- `.getVariable(name)` allows you to get a variable
- `.processActionQueue(message)` processes the current action queue using the specified method (not recommended for use - see `Bots.processActions()` instead
- `.actionQueue` an array containing a list of actions
- `.nextActionQueue` an array containing a list of actions for next time

In addition to using the variables on the bot, the `Bots` object also has some useful properties:

- `.setVariable(name, value)` sets a variable for all bots (note that if a bot already has a value it will use its own value instead)
- `.push(bot)` adds a bot to the bot system
- `.find(name)` finds a bot
- `.sendMessage(botname, message, variables)` sends a message to the specified bot, also setting the specified variables
- `.processActions(bot, message)` adds an item to the action queue and then executes it
- `.utils` an object providing utilities

So, let's say we've created a bot called `MyBot`. Here's how we call it.

    var out = Bots.sendMessage("MyBot", "hello", { "USER": "me" });
    console.log(out);

`Bots.sendMessage()` will process the action queue (where streams are stored), and return the required result. Using this, we can create a live bot chat page:

**Javascript**

    $(function() {
        var input = $("input"), username = "me";
        $("form").submit(function(e) {
            var r = Bots.sendMessage("MyBot", input.val(), { "USER": username });
            $("<p style='display:none;'></p>").appendTo("div").text("[" + username + "] " + input.val()).fadeIn("fast", toBottom);
            input.val("");
            
            setTimeout(function() {
                for (var i = 0; i < r.length; i++) {
                    $("<p style='display:none;'></p>").appendTo("div").text(r[i]).fadeIn("fast", toBottom);
                }
            }, Math.random() * 1000);
            
            e.preventDefault();
            return false;
        });
    });
    
    function toBottom() {
        $("<div>").scrollTop($("div").get("scrollHeight"));
    }

**HTML**

    <form method="get" action="#">
        <input type="text" /><button type="submit">Go</button>
    </form>
