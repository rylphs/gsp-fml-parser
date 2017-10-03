// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(d:any[]):any {return d[0];}
declare var dynfml:any;
declare var quoted:any;
declare var argument:any;
declare var r1c1:any;
declare var r2c2:any;
declare var anythingElse:any;

declare var exports:any;
declare var require:any;
declare var module:any;

var module = module || {exports};
const context:any = !!module ? module.exports : {}

const moo = require("moo");

const lexer = moo.compile({
    arr: {match: /\{[^{}]+\}/},
 //   escaped: {match: /\\%[0-9]+/, value: (str) => str.replace(/^\\+/, '')},
    quoted: {match: /"[^"]*"/},
    argument: {match: /%[0-9]+/, value: (arg) => arg.replace(/^\%/, '')},
    dynfml: {match: /\%[\w]+[ \t]*\(/ },
    r2c2: {match: /\s*\%[Rr][\+\-][0-9]+[Cc][\+\-][0-9]+\s*/},
    r1c1: {match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/},
    
    anythingElse: {match: /[^%]+/, lineBreaks: true},
    
});

const nuller = () => null;
const flatten = (arr) => arr[0][0];
const replaceArg = ([argIndex]) => {
    argIndex.value = context.args[Number(argIndex.value)] || "";
    return argIndex;
}
export interface Token {value:any; [key: string]:any};
export interface Lexer {reset:(chunk:string, info:any) => void; next:() => Token | undefined; save:() => any; formatError:(token:Token) => string; has:(tokenType:string) => boolean};
export interface NearleyRule {name:string; symbols:NearleySymbol[]; postprocess?:(d:any[],loc?:number,reject?:{})=>any};
export type NearleySymbol = string | {literal:any} | {test:(token:any) => boolean};
export var Lexer:Lexer|undefined = lexer;
export var ParserRules:NearleyRule[] = [
    {"name": "main", "symbols": ["exp"], "postprocess": flatten},
    {"name": "exp$ebnf$1", "symbols": []},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("dynfml") ? {type: "dynfml"} : dynfml)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("quoted") ? {type: "quoted"} : quoted)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("argument") ? {type: "argument"} : argument)], "postprocess": replaceArg},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("r1c1") ? {type: "r1c1"} : r1c1)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("r2c2") ? {type: "r2c2"} : r2c2)], "postprocess": id},
    {"name": "exp$ebnf$1$subexpression$1", "symbols": [(lexer.has("anythingElse") ? {type: "anythingElse"} : anythingElse)], "postprocess": id},
    {"name": "exp$ebnf$1", "symbols": ["exp$ebnf$1", "exp$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "exp", "symbols": ["exp$ebnf$1"]}
];
export var ParserStart:string = "main";
