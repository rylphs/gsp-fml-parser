declare var require:any;

const nearley = require("nearley");
const argGrammar = require("./argument-grammar.js");
const fmlGrammar = require("./formula-grammar.js");

export function parse(map: any, value: string, args?: string[]) {
    // console.log("parsing... '" +  value + "'", args);
    var parsed = "";
    const fmlParser = <any> new nearley.Parser(nearley.Grammar.fromCompiled(fmlGrammar));
    var argParser = <any> new nearley.Parser(nearley.Grammar.fromCompiled(argGrammar));
    if (args) {
        
        argGrammar.args = args;
        
        argParser.feed(value);
        value = argParser.results[0].reduce(
            (value, item) => value + (item.value || "")
        , "");
        argGrammar.args = [];
        // console.log("replacing arguments ", value)
        //console.log("args result ", value);
    }
    fmlParser.feed(value);
    
    var results = fmlParser.results[0];
    for(var i in results){
        
        var result = results[i];// console.log("result ", result);
        if(result.type !== 'dynfml'){
            parsed += result.value;
            continue;
        }

        // console.log("parsing token ", result);
        // console.log("parsing args ", result.args);
        for(var j in result.args){
            result.args[j] = parse(map, result.args[j]);
        }
        parsed += "(" + parse(map, map[result.value], result.args) + ")";
    }

    // console.log("result ", parsed);
    return parsed;
}