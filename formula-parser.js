const nearley = require("nearley");
const grammar = require("./formula-grammar.js");


var parse = function(map, value){ console.log("parsing...", value)
    grammar.args = [];
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
        parser.feed(value);
    } catch(parseError) {
        console.log("Error at character " + parseError); // "Error at character 9"
    }
    //  console.log((parser.results));
    var results = parser.results[0];
    for(var i in results) {
        var result = results[i];
        if(result && result.type == 'dynfml'){
            var fml = map[result.value];
            result.text = fml.replace(/\%([0-9]+)/g, function(m, p, o, s){
                return result.args[Number(p)] || s;
            });
            result.text = "(" + parse(map, result.text) + ")";

            console.log("result: ", result.text);
        }
    }

    console.log(JSON.stringify(results));
    return results.reduce((r, item)=>{
        if(!item) return r;
        return r.concat(item.text);
    }, "");
}

module.exports.parse = parse;