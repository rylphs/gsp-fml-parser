"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
var moo = require("moo");
var lexer = moo.compile({
    rngst: { match: /%(?:row|col|cell)/ },
    op: { match: /[\<\>\+\-]/ },
    count: { match: /[0-9]+/ },
    opType: { match: /(?:row|col)s?/ }
});
var values = [];
var currentValue = [0, 0, 0, 0];
var shiftPlus;
var signal;
var count;
var colRow;
var ungroup = function (arr) {
    return [arr[0]].concat(arr[1].reduce(function (flat, item) {
        flat.push.apply(flat, item);
        return flat;
    }, []));
};
var parseStart = function (_a) {
    var rng = _a[0];
    return rng.value;
};
var parseOp = function (_a) {
    var op = _a[0];
    currentValue = [0, 0, 0, 0];
    values.push(currentValue);
    signal = ("+>".indexOf(op.value) >= 0) ? 1 : -1;
    shiftPlus = ("<>".indexOf(op.value) >= 0) ? 0 : 1;
    return null;
};
var parseCount = function (_a) {
    var c = _a[0];
    count = c.value;
    return null;
};
var parseOpType = function (_a) {
    var op = _a[0];
    console.log("cols".indexOf(op.value));
    var paramArray = [0, 0];
    colRow = ("cols".indexOf(op.value) >= 0) ? 1 : 0;
    var index = 2 * shiftPlus + colRow;
    paramArray[index] = signal * count;
    return paramArray;
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "main$ebnf$1", "symbols": [] },
    { "name": "main$ebnf$1$subexpression$1", "symbols": ["op", "count", "opType"] },
    { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "main", "symbols": ["rngst", "main$ebnf$1"], "postprocess": ungroup },
    { "name": "rngst", "symbols": [(lexer.has("rngst") ? { type: "rngst" } : rngst)], "postprocess": parseStart },
    { "name": "op", "symbols": [(lexer.has("op") ? { type: "op" } : op)], "postprocess": parseOp },
    { "name": "count", "symbols": [(lexer.has("count") ? { type: "count" } : count)], "postprocess": parseCount },
    { "name": "opType", "symbols": [(lexer.has("opType") ? { type: "opType" } : opType)], "postprocess": parseOpType }
];
exports.ParserStart = "main";
