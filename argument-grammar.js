"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(d) { return d[0]; }
var module = module || { exports: exports };
var context = !!module ? module.exports : {};
var moo = require("moo");
var lexer = moo.compile({
    escaped: { match: /\\%[0-9]+/, value: function (str) { return str.replace(/^\\+/, ''); } },
    quoted: { match: /"[^"]*"/ },
    argument: { match: /%[0-9]+/, value: function (arg) { return arg.replace(/^\%/, ''); } },
    dynfml: { match: /\%[\w]+[ \t]*\(/ },
    anythingElse: { match: /(?:\\[^%])?[^%"\\]+/, lineBreaks: true }
});
var nuller = function () { return null; };
var flatten = function (arr) { return arr[0][0]; };
var replaceArg = function (_a) {
    var argIndex = _a[0];
    argIndex.value = context.args[Number(argIndex.value)] || "";
    return argIndex;
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "main", "symbols": ["exp"], "postprocess": flatten },
    { "name": "exp$ebnf$1", "symbols": [] },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("escaped") ? { type: "escaped" } : escaped)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("quoted") ? { type: "quoted" } : quoted)], "postprocess": id },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("argument") ? { type: "argument" } : argument)], "postprocess": replaceArg },
    { "name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("anythingElse") ? { type: "anythingElse" } : anythingElse)], "postprocess": id },
    { "name": "exp$ebnf$1", "symbols": ["exp$ebnf$1", "exp$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "exp", "symbols": ["exp$ebnf$1"] }
];
exports.ParserStart = "main";
