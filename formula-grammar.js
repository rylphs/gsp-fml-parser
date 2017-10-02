"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(d) { return d[0]; }
var moo = require("moo");
var fmlStack = [];
var fmlMap = {};
var processFml = function (_a) {
    var fml = _a[0], firstParam = _a[1], restParams = _a[2], endFml = _a[3];
    fml.args = [firstParam.text].concat(restParams.map(function (item) { return item[1].text; }));
    return fml;
};
var processParam = function (arr) {
    var arg = arr[0];
    if (fmlStack.length <= 0)
        return arg;
    var fml = fmlStack.pop();
    fml.args = fml.args || [];
    fml.args.push(arg.text);
    fmlStack.push(fml);
    return arg;
};
var oneString = function (arr) {
    arr[0].text = flatten(arr).reduce(function (reduced, item) { return reduced + (item.text || ""); }, "");
    return arr[0];
};
var processEndFml = function (arr) {
    fmlStack.pop();
    return null;
};
var flatten = function (arr) {
    return arr.reduce(function (flat, item) {
        if (item instanceof Array)
            flat.push.apply(flat, flatten(item));
        else if (!!item)
            flat.push(item);
        return flat;
    }, []);
};
var token = function (name, opt) {
    if (opt === void 0) { opt = {}; }
    var tks = {
        posArg: { match: /%[0-9]+/, value: function (v) { return v.replace(/^./, ''); } },
        dynfml: { match: /\%[\w]+[ \t]*\(/,
            value: function (name) { return name.substring(1, name.length - 1); } },
        number: { match: /[0-9]+/ },
        op: { match: /[\+\-\/\*]/ },
        fml: { match: /[A-Za-z][A-Za-z0-9]*\(/ },
        a1b1: { match: /(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)/ },
        endFml: { match: /\)/, pop: true },
        dynrng2: { match: /\%(?:[RrCc]|[Rr][Cc])/ },
        dynrng: { match: /\%(?:[RrCc]|[Rr][Cc])(?:[\>\<\+\-][0-9]+[RrCc]?)*/ },
        r1c1: { match: /[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?/,
            value: function (r1c1) { return 'INDIRECT("' + r1c1 + '";FALSE)'; } },
        param: { match: /[^;\)]+/, lineBreaks: true },
        sep: ";",
        rngop: { match: /[\>\<\+\-]/ },
        rngcount: { match: /[0-9]+/, value: function (n) { return Number(n); } },
        rngtp: { match: /(?:rows|cols)/ },
        rp: { match: /\)/, pop: true },
        pspl: { match: /;/, pop: true },
        spc: { match: /[\t ]+/, pop: true }
    };
    var tk = tks[name];
    for (var i in opt) {
        tk[i] = opt[i];
    }
    return tk;
};
var lexer = moo.states({
    main: {
        posArg: token("posArg"),
        dynfml: token("dynfml", { push: "fml" }),
        number: token("number"),
        op: token("op"),
        fml: token("fml", { push: "fml" }),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        dynrng: token("dynrng"),
    },
    fml: {
        endFml: token("endFml", { pop: true }),
        number: token("number"),
        dynfml: token("dynfml", { push: "fml" }),
        fml: token("fml", { push: "fml" }),
        posArg: token("posArg"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        dynrng: token("dynrng"),
        //param: token("param"),
        sep: token("sep"),
    }
});
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "main$ebnf$1", "symbols": [] },
    { "name": "main$ebnf$1$subexpression$1", "symbols": [(lexer.has("op") ? { type: "op" } : op), "exp"] },
    { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "main", "symbols": ["exp", "main$ebnf$1"], "postprocess": flatten },
    { "name": "exp", "symbols": ["fmlXp"], "postprocess": id },
    { "name": "exp", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": id },
    { "name": "exp", "symbols": [(lexer.has("posArg") ? { type: "posArg" } : posArg)], "postprocess": id },
    { "name": "exp", "symbols": ["rng"], "postprocess": id },
    { "name": "fmlXp", "symbols": ["fml"], "postprocess": id },
    { "name": "fmlXp", "symbols": ["dynfml"], "postprocess": id },
    { "name": "fml$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "fml$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "fml$ebnf$2", "symbols": [] },
    { "name": "fml$ebnf$2$subexpression$1", "symbols": [{ "literal": ";" }, "param"] },
    { "name": "fml$ebnf$2", "symbols": ["fml$ebnf$2", "fml$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "fml", "symbols": [(lexer.has("fml") ? { type: "fml" } : fml), "fml$ebnf$1", "fml$ebnf$2", "endFml"] },
    { "name": "dynfml$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "dynfml$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "dynfml$ebnf$2", "symbols": [] },
    { "name": "dynfml$ebnf$2$subexpression$1", "symbols": [{ "literal": ";" }, "param"] },
    { "name": "dynfml$ebnf$2", "symbols": ["dynfml$ebnf$2", "dynfml$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "dynfml", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml), "dynfml$ebnf$1", "dynfml$ebnf$2", "endFml"], "postprocess": processFml },
    { "name": "rng", "symbols": [(lexer.has("a1b1") ? { type: "a1b1" } : a1b1)], "postprocess": id },
    { "name": "rng", "symbols": [(lexer.has("r1c1") ? { type: "r1c1" } : r1c1)], "postprocess": id },
    { "name": "param", "symbols": ["exp2"], "postprocess": id },
    { "name": "exp2", "symbols": ["fmlXp2"], "postprocess": id },
    { "name": "exp2", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": id },
    { "name": "exp2", "symbols": [(lexer.has("posArg") ? { type: "posArg" } : posArg)], "postprocess": id },
    { "name": "exp2", "symbols": ["rng"], "postprocess": id },
    { "name": "fmlXp2", "symbols": ["fml2"], "postprocess": id },
    { "name": "fmlXp2", "symbols": ["dynfml2"], "postprocess": id },
    { "name": "fml2$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "fml2$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "fml2$ebnf$2", "symbols": [] },
    { "name": "fml2$ebnf$2$subexpression$1", "symbols": [{ "literal": ";" }, "param"] },
    { "name": "fml2$ebnf$2", "symbols": ["fml2$ebnf$2", "fml2$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "fml2", "symbols": [(lexer.has("fml") ? { type: "fml" } : fml), "fml2$ebnf$1", "fml2$ebnf$2", "endFml"], "postprocess": oneString },
    { "name": "dynfml2$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "dynfml2$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "dynfml2$ebnf$2", "symbols": [] },
    { "name": "dynfml2$ebnf$2$subexpression$1", "symbols": [{ "literal": ";" }, "param"] },
    { "name": "dynfml2$ebnf$2", "symbols": ["dynfml2$ebnf$2", "dynfml2$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "dynfml2", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml), "dynfml2$ebnf$1", "dynfml2$ebnf$2", "endFml"], "postprocess": processFml },
    { "name": "endFml", "symbols": [(lexer.has("endFml") ? { type: "endFml" } : endFml)] }
];
exports.ParserStart = "main";
