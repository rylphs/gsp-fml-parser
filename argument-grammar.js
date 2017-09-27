// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

const moo = require("moo");

module.exports.args = [];

const lexer = moo.compile({
    escaped: {match: /\\%[0-9]+/, value: (str) => str.replace(/^\\+/, '')},
    quoted: {match: /"[^"]*"/},
    argument: {match: /%[0-9]+/, value: (arg) => arg.replace(/^\%/, '')},
    dynfml: {match: /\%[\w]+[ \t]*\(/ },
    anythingElse: {match: /(?:\\[^%])?[^%"\\]+/, lineBreaks: true} 
});

const nuller = () => null;
const flatten = (arr) => arr[0][0];
const replaceArg = ([argIndex]) => {
    argIndex.value = module.exports.args[Number(argIndex.value)] || "";
    return argIndex;
}
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["exp"], "postprocess": flatten},
    {"name": "exp$ebnf$1", "symbols": []},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("escaped") ? {type: "escaped"} : escaped)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("dynfml") ? {type: "dynfml"} : dynfml)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("quoted") ? {type: "quoted"} : quoted)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("argument") ? {type: "argument"} : argument)], "postprocess": replaceArg},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("anythingElse") ? {type: "anythingElse"} : anythingElse)], "postprocess": id},
    {"name": "exp$ebnf$1", "symbols": ["exp$ebnf$1", "exp$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "exp", "symbols": ["exp$ebnf$1"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
