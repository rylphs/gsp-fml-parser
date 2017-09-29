// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(d:any[]):any {return d[0];}
declare var rngst:any;
declare var op:any;
declare var count:any;
declare var opType:any;

declare var exports:any;
declare var require:any;
declare var module:any;

const moo = require("moo");

const lexer = moo.compile({
    rngst: {match:/%(?:row|col|cell)/},
    op: {match: /[\<\>\+\-]/},
    count: {match: /[0-9]+/},
    opType: {match: /(?:row|col)s?/}
});

var values = [];
var currentValue = [0,0,0,0];
var shiftPlus;
var signal;
var count;
var colRow;

const ungroup = (arr) => {
    return [arr[0]].concat(arr[1].reduce((flat, item)=>{
        flat.push.apply(flat, item);
        return flat;
    }, []));
}

const parseStart = ([rng]) => rng.value;

const parseOp = ([op]) => {
    currentValue = [0,0,0,0]
    values.push(currentValue);
    signal = ("+>".indexOf(op.value) >= 0) ? 1 : -1;
    shiftPlus = ("<>".indexOf(op.value) >= 0) ? 0 : 1;
    return null;
}

const parseCount = ([c]) => {
    count = c.value;
    return null;
}

const parseOpType = ([op]) => { console.log("cols".indexOf(op.value));
    var paramArray = [0,0];
    colRow = ("cols".indexOf(op.value) >= 0) ? 1 : 0;
    var index = 2 * shiftPlus + colRow;
    paramArray[index] = signal * count;
    return paramArray; 
}

export interface Token {value:any; [key: string]:any};
export interface Lexer {reset:(chunk:string, info:any) => void; next:() => Token | undefined; save:() => any; formatError:(token:Token) => string; has:(tokenType:string) => boolean};
export interface NearleyRule {name:string; symbols:NearleySymbol[]; postprocess?:(d:any[],loc?:number,reject?:{})=>any};
export type NearleySymbol = string | {literal:any} | {test:(token:any) => boolean};
export var Lexer:Lexer|undefined = lexer;
export var ParserRules:NearleyRule[] = [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["op", "count", "opType"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "main", "symbols": ["rngst", "main$ebnf$1"], "postprocess": ungroup},
    {"name": "rngst", "symbols": [(lexer.has("rngst") ? {type: "rngst"} : rngst)], "postprocess": parseStart},
    {"name": "op", "symbols": [(lexer.has("op") ? {type: "op"} : op)], "postprocess": parseOp},
    {"name": "count", "symbols": [(lexer.has("count") ? {type: "count"} : count)], "postprocess": parseCount},
    {"name": "opType", "symbols": [(lexer.has("opType") ? {type: "opType"} : opType)], "postprocess": parseOpType}
];
export var ParserStart:string = "main";
