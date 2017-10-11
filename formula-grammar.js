"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
var moo = require("moo");
var fmlStack = [];
var fmlMap = {};
var processFml = function (_a) {
    var fml = _a[0], firstParam = _a[1], restParams = _a[2], endFml = _a[3];
    fml.args = firstParam ?
        [firstParam.value].concat(restParams.map(function (item) { return item[1].value; })) :
        [];
    return fml;
};
var text2Value = function (_a) {
    var item = _a[0];
    item.text = item.value;
    return item;
};
var processParam = function (arr) {
    var arg = arr[0];
    if (fmlStack.length <= 0)
        return arg;
    var fml = fmlStack.pop();
    fml.args = fml.args || [];
    fml.args.push(arg.value);
    fmlStack.push(fml);
    return arg;
};
var oneString = function (arr) {
    arr[0].text = flatten(arr).reduce(function (reduced, item) {
        reduced += (item.text || "");
        return reduced;
    }, "");
    arr[0].value = arr[0].text;
    return arr[0];
};
var cpValue2Text = function (_a) {
    var item = _a[0];
    item.text = item.value;
    return item;
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
var trim = function (v) { return v.trim(); };
var removePercent = function (v) { return v.trim().replace(/^\%/, ''); };
var formatFml = function (v) { return v.trim().replace(/\s*\%([\w]+)[\s]*\(\s*/, '$1'); };
var removeSpaces = function (v) { return v.replace(/\s*/g, ''); };
var token = function (name, opt) {
    if (opt === void 0) { opt = {}; }
    var tks = {
        lp: { match: /\(/, value: trim },
        rp: { match: /\)/, value: trim },
        posArg: { match: /\s*%[0-9]+\s*/, value: removePercent },
        dynfml: { match: /\s*\%[\w]+[\s]*\(\s*/, value: formatFml },
        number: { match: /\s*(?:[0-9]?[,\.])?[0-9]+\s*/, value: trim },
        op: { match: /\s*(?:<>|<=|>=|[\^\+\-\/\*><=])\s*/, value: trim },
        fml: { match: /\s*(?:[A-Za-z][A-Za-z0-9]*)?\s*\(\s*/, value: removeSpaces },
        a1b1: {
            match: /\s*(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)\s*/,
            value: trim
        },
        endFml: { match: /\s*\)\s*/, pop: true, value: trim },
        r1c1: { match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/,
            value: function (r1c1) { return 'INDIRECT("' + trim(r1c1).toUpperCase().replace(/^\%/, '') + '";FALSE)'; } },
        r2c2: { match: /\s*\%[Rr][\+\-][0-9]+[Cc][\+\-][0-9]+\s*/,
            value: function (r1c1) { return 'INDIRECT("' +
                trim(r1c1).toUpperCase().replace(/^\%/, '').replace(/([\+\-][0-9]+)/g, '[$1]').replace(/\+/g, '') +
                '";FALSE)'; } },
        sep: { match: /\s*;\s*/, value: trim },
        quote_: { match: /\s*"/, value: trim },
        _quote: { match: /"\s*/, value: trim },
        boolean: { match: /(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])/, value: trim },
        arr: { match: /\{[^\{\}]+\}/, value: trim }
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
        r2c2: token("r2c2"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        quote_: token("quote_", { push: "quote" }),
        boolean: token("boolean"),
        arr: token("arr")
    },
    quote: {
        _quote: token("_quote", { pop: true }),
        quoted: { match: /[^"]+/, lineBreaks: true }
    },
    fml: {
        boolean: token("boolean"),
        quote_: token("quote_", { push: "quote" }),
        endFml: token("endFml", { pop: true }),
        number: token("number"),
        op: token("op"),
        dynfml: token("dynfml", { push: "fml" }),
        fml: token("fml", { push: "fml" }),
        posArg: token("posArg"),
        r2c2: token("r2c2"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        sep: token("sep"),
        arr: token("arr")
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
    { "name": "exp", "symbols": ["primitive"], "postprocess": id },
    { "name": "exp", "symbols": [(lexer.has("posArg") ? { type: "posArg" } : posArg)], "postprocess": id },
    { "name": "primitive", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": id },
    { "name": "primitive", "symbols": ["quote"], "postprocess": id },
    { "name": "primitive", "symbols": [(lexer.has("boolean") ? { type: "boolean" } : boolean)], "postprocess": id },
    { "name": "primitive", "symbols": ["rng"], "postprocess": id },
    { "name": "primitive", "symbols": [(lexer.has("arr") ? { type: "arr" } : arr)], "postprocess": id },
    { "name": "fmlXp", "symbols": ["fml"], "postprocess": id },
    { "name": "fmlXp", "symbols": ["dynfml"], "postprocess": id },
    { "name": "fml$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "fml$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "fml$ebnf$2", "symbols": [] },
    { "name": "fml$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? { type: "sep" } : sep), "param"] },
    { "name": "fml$ebnf$2", "symbols": ["fml$ebnf$2", "fml$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "fml", "symbols": [(lexer.has("fml") ? { type: "fml" } : fml), "fml$ebnf$1", "fml$ebnf$2", "endFml"], "postprocess": processFml },
    { "name": "dynfml$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "dynfml$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "dynfml$ebnf$2", "symbols": [] },
    { "name": "dynfml$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? { type: "sep" } : sep), "param"] },
    { "name": "dynfml$ebnf$2", "symbols": ["dynfml$ebnf$2", "dynfml$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "dynfml", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml), "dynfml$ebnf$1", "dynfml$ebnf$2", "endFml"], "postprocess": processFml },
    { "name": "rng", "symbols": [(lexer.has("a1b1") ? { type: "a1b1" } : a1b1)], "postprocess": id },
    { "name": "rng", "symbols": [(lexer.has("r1c1") ? { type: "r1c1" } : r1c1)], "postprocess": text2Value },
    { "name": "rng", "symbols": [(lexer.has("r2c2") ? { type: "r2c2" } : r2c2)], "postprocess": text2Value },
    { "name": "quote$ebnf$1", "symbols": [(lexer.has("quoted") ? { type: "quoted" } : quoted)], "postprocess": id },
    { "name": "quote$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "quote", "symbols": [(lexer.has("quote_") ? { type: "quote_" } : quote_), "quote$ebnf$1", (lexer.has("_quote") ? { type: "_quote" } : _quote)], "postprocess": oneString },
    { "name": "endFml", "symbols": [(lexer.has("endFml") ? { type: "endFml" } : endFml)], "postprocess": id },
    { "name": "param", "symbols": ["main2"], "postprocess": id },
    { "name": "main2$ebnf$1", "symbols": [] },
    { "name": "main2$ebnf$1$subexpression$1", "symbols": [(lexer.has("op") ? { type: "op" } : op), "exp2"] },
    { "name": "main2$ebnf$1", "symbols": ["main2$ebnf$1", "main2$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "main2", "symbols": ["exp2", "main2$ebnf$1"], "postprocess": oneString },
    { "name": "exp2", "symbols": ["fmlXp2"], "postprocess": id },
    { "name": "exp2", "symbols": ["primitive"], "postprocess": id },
    { "name": "exp2", "symbols": [(lexer.has("posArg") ? { type: "posArg" } : posArg)], "postprocess": id },
    { "name": "fmlXp2", "symbols": ["fml2"], "postprocess": id },
    { "name": "fmlXp2", "symbols": ["dynfml2"], "postprocess": id },
    { "name": "fml2$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "fml2$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "fml2$ebnf$2", "symbols": [] },
    { "name": "fml2$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? { type: "sep" } : sep), "param"] },
    { "name": "fml2$ebnf$2", "symbols": ["fml2$ebnf$2", "fml2$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "fml2", "symbols": [(lexer.has("fml") ? { type: "fml" } : fml), "fml2$ebnf$1", "fml2$ebnf$2", "endFml"], "postprocess": oneString },
    { "name": "dynfml2$ebnf$1", "symbols": ["param"], "postprocess": id },
    { "name": "dynfml2$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "dynfml2$ebnf$2", "symbols": [] },
    { "name": "dynfml2$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? { type: "sep" } : sep), "param"] },
    { "name": "dynfml2$ebnf$2", "symbols": ["dynfml2$ebnf$2", "dynfml2$ebnf$2$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "dynfml2", "symbols": [(lexer.has("dynfml") ? { type: "dynfml" } : dynfml), "dynfml2$ebnf$1", "dynfml2$ebnf$2", "endFml"], "postprocess": oneString }
];
exports.ParserStart = "main";
