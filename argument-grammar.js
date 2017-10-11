"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
var module = module || { exports: exports };
var context = !!module ? module.exports : {};
var moo = require("moo");
var lexer = moo.compile({
    arr: { match: /\{[^{}]+\}/ },
    quoted: { match: /"[^"]*"/ },
    argument: { match: /%[0-9]+/, value: function (arg) { return arg.replace(/^\%/, ''); } },
    dynfml: { match: /\%[\w]+[ \t]*\(/ },
    r2c2: { match: /\s*\%[Rr][\+\-][0-9]+[Cc][\+\-][0-9]+\s*/ },
    r1c1: { match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/ },
    anythingElse: { match: /[^%]+/, lineBreaks: true },
});
var nuller = function () { return null; };
var flatten = function (arr) { return arr[0][0]; };
var replaceArg = function (_a) {
    var argIndex = _a[0];
    console.log("processed? ", argIndex.processed);
    if (!!argIndex.processed)
        return argIndex;
    argIndex.processed = true;
    argIndex.value = context.args[Number(argIndex.value)] || "";
    argIndex.text = argIndex.value;
    return argIndex;
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "main", "symbols": ["exp"], "postprocess": flatten },
    { "name": "exp$ebnf$1", "symbols": [] },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("quoted") ? { type: "quoted" } : quoted)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("argument") ? { type: "argument" } : argument)], "postprocess": replaceArg },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("r1c1") ? { type: "r1c1" } : r1c1)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("r2c2") ? { type: "r2c2" } : r2c2)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("anythingElse") ? { type: "anythingElse" } : anythingElse)], "postprocess": id },
    { "name": "exp$ebnf$1", "symbols": ["exp$ebnf$1", "exp$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "exp", "symbols": ["exp$ebnf$1"] }
];
exports.ParserStart = "main";
