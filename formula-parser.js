"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nearley = require("nearley");
var argGrammar = require("./argument-grammar.js");
var fmlGrammar = require("./formula-grammar.js");
function parse(map, value, args) {
    // console.log("parsing... ", value, args);
    var parsed = "";
    var fmlParser = new nearley.Parser(nearley.Grammar.fromCompiled(fmlGrammar));
    var argParser = new nearley.Parser(nearley.Grammar.fromCompiled(argGrammar));
    if (args) {
        argGrammar.args = args;
        argParser.feed(value);
        value = argParser.results[0].reduce(function (value, item) { return value + (item.value || ""); }, "");
        argGrammar.args = [];
        // console.log("replacing arguments ", value)
        //console.log("args result ", value);
    }
    fmlParser.feed(value);
    var results = fmlParser.results[0];
    for (var i in results) {
        var result = results[i]; // console.log("result ", result);
        if (result.type !== 'dynfml') {
            parsed += result.text;
            continue;
        }
        // console.log("parsing token ", result);
        // console.log("parsing args ", result.args);
        for (var j in result.args) {
            result.args[j] = parse(map, result.args[j]);
        }
        parsed += "(" + parse(map, map[result.value], result.args) + ")";
    }
    // console.log("result ", parsed);
    return parsed;
}
exports.parse = parse;
