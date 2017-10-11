declare var require:any;

const nearley = require("nearley");
const argGrammar = require("./argument-grammar.js");
const fmlGrammar = require("./formula-grammar.js");

export function parse(map: any, value: string){
    var fmlMap = {};
    for(var fmlName in map){
        fmlMap[fmlName.toUpperCase()] = map[fmlName];
    }
    return parseFml(fmlMap, value);
}

function replaceArguments(value: string, args: string[]){
    //console.log('replacing args ', args);
    var argParser = <any> new nearley.Parser(nearley.Grammar.fromCompiled(argGrammar));
    argGrammar.args = args;
    argParser.feed(value); 
    
    value = argParser.results[0].reduce(
        (value, item) => value + (item.value || "")
    , "");
    argGrammar.args = [];
    // console.log("result  ", value);console.log("\n\n");
    return value;
}

function parseFml(map: any, value: string, args?: string[]) {
   // console.log("start parsing... '" +  value + "'", args); console.log("\n\n");

    var parsed = "";
    const fmlParser = <any> new nearley.Parser(nearley.Grammar.fromCompiled(fmlGrammar));
    
    if (args) {
        console.log("replacing args...", value, args);
        value = replaceArguments(value, args);
        console.log("result ", value);
    }

    //console.log("feeding value on fmlparser  ");console.log("\n\n");
    fmlParser.feed(value);
    
    var results = fmlParser.results[0];
    for(var i in results){
        var result = results[i];

        if(result.args){
            result.args = result.args.map((arg)=>parseFml(map, arg))

            if(result.type == 'fml'){
                parsed += result.text + result.args.join(';') + ")";
            }

            else {
                parsed += "(" + parseFml(map, map[result.value.toUpperCase()], result.args) + ")";
            }
        }

       else{
           // console.log("token not fml, just concat value  ", result.text);console.log("\n\n");
            parsed += result.text;
            continue;
       }
    }

    //console.log("final result  ", parsed);console.log("\n\n");
    return parsed;
}