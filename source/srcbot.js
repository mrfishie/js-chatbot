Bots.push({
    "name": "Image Parsing Bot",
    "precatch": function(text) {
        return text.replace("'", " ' ").replace('"', ' " ');
    },
    "actions": [
        {
            "catch": ["<img*src= ' {=N} '  />", '<img*src= " {=N} "  />'],
            "response": ""
        }
    ],
    "postcatch": function(text) {
        return "The source is " + this.getVariable("N");
    }
});