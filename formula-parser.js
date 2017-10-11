"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nearley = require("nearley");
var argGrammar = require("./argument-grammar.js");
var fmlGrammar = require("./formula-grammar.js");
function parse(map, value) {
    var fmlMap = {};
    for (var fmlName in map) {
        fmlMap[fmlName.toUpperCase()] = map[fmlName];
    }
    return parseFml(fmlMap, value);
}
exports.parse = parse;
function replaceArguments(value, args) {
    var argParser = new nearley.Parser(nearley.Grammar.fromCompiled(argGrammar));
    argGrammar.args = args;
    argParser.feed(value);
    value = argParser.results[0].reduce(function (value, item) { return value + (item.value || ""); }, "");
    argGrammar.args = [];
    return value;
}
function parseFml(map, value, args) {
    var parsed = "";
    var fmlParser = new nearley.Parser(nearley.Grammar.fromCompiled(fmlGrammar));
    if (args) {
        console.log("replacing args...", value, args);
        value = replaceArguments(value, args);
        console.log("result ", value);
    }
    fmlParser.feed(value);
    var results = fmlParser.results[0];
    for (var i in results) {
        var result = results[i];
        if (result.args) {
            result.args = result.args.map(function (arg) { return parseFml(map, arg); });
            if (result.type == 'fml') {
                console.log("join result", result.args, result.args.join(';'));
                parsed += result.text + result.args.join(';') + ")";
            }
            else {
                parsed += "(" + parseFml(map, map[result.value.toUpperCase()], result.args) + ")";
            }
        }
        else {
            parsed += result.text;
            continue;
        }
    }
    return parsed;
}
