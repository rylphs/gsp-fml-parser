    const parser = require("./formula-parser.js")

const nearley = require("nearley");
const grammar2 = require("./argument-grammar.js");
const stylegrammar = require("./stylize-grammar.js");

var map = {
    f0: "sumproduct(325;%0)",
    e4: "(%0+%0+%0)",
    quad: "%0^2",
    quarta: "%quad(%0)^2",
    formula: "sum(%0;%1)/%0",
    f2: "sum(%0;count(5))/%0",
    f3: "sum(25)*%formula(%0;8)+3",
    f4: "sum(%f0(25))*%0",
    acumulado: "%r[-1]c[0]*%0",
    g: "(sum(%f0(%0)))",
    "ComeCotas": '(((%0+1)^(1/(%1*2))-1)*,85+1)^(%1*2)-1',
    h: "sum(%f0(%0))",
    Meses: 'IF(%0 <> "";DATEDIF(%0;now();"M");0)',
    "IR" : 'IF(%0 <>"";HLOOKUP(%Meses(%0);{0\\6\\12\\24;0,225\\0,2\\0,175\\0,15};2;TRUE);"")',
    IRPF: 'HLOOKUP(DATEDIF(%0;NOW();"M");{0\\6\\12\\24;0,225\\0,2\\0,175\\0,15};2;TRUE)'
}

const test = function(){
    var testInput = [
       {text: "%acumulado(%r[0]c[-1])", result: "(INDIRECT(\"R[-1]C[0]\";FALSE)*INDIRECT(\"R[0]C[-1]\";FALSE))"},
        {text: "%acumulado(%r+0c-1)", result: "(INDIRECT(\"R[-1]C[0]\";FALSE)*INDIRECT(\"R[0]C[-1]\";FALSE))"},
        {text: "%formula(5;\" 6\")+sum(10)", result: "(sum(5;\" 6\")/5)+sum(10)"},
        {text: "%f2(s(32))+sum(10)", result: "(sum(s(32);count(5))/s(32))+sum(10)"},
        {text: "%f3(9)", result: "(sum(25)*(sum(9;8)/9)+3)"},
        {text: "%f4(56)", result: "(sum((sumproduct(325;25)))*56)"},
        {text: "%f4(%r[0]c[-1])", result: "(sum((sumproduct(325;25)))*INDIRECT(\"R[0]C[-1]\";FALSE))"},
        {text: "%f3(A5)", result: "(sum(25)*(sum(A5;8)/A5)+3)"},
        {text: "%f3(A5)*(3+4)", result: "(sum(25)*(sum(A5;8)/A5)+3)*(3+4)"},
        {text: "%f3(A5)*(3+4)", result: "(sum(25)*(sum(A5;8)/A5)+3)*(3+4)"},
        {text: "%IRPF(%R+0C-1)", result: '(HLOOKUP(DATEDIF(INDIRECT("R[0]C[-1]";FALSE);NOW();"M");{0\\6\\12\\24;0,225\\0,2\\0,175\\0,15};2;TRUE))'},
        {text: "%Ir(%R+0C-1)", 
            result: '(IF(INDIRECT("R[0]C[-1]";FALSE)<>"";HLOOKUP((IF(INDIRECT("R[0]C[-1]";FALSE)<> "";DATEDIF(INDIRECT("R[0]C[-1]";FALSE);now();"M");0));{0\\6\\12\\24;0,225\\0,2\\0,175\\0,15};2;TRUE);""))'},
        {text:"%quarta(4)^3,6", result: "((4^2)^2)^3,6"},
        {text:"%quarta(4)^,6", result: "((4^2)^2)^,6"},
        {text:"%quarta(4)^.6", result: "((4^2)^2)^.6"},
        {text: "%e4(1)", result: "((1+1+1))"},
       //{text: "%COMECOTAS(D1;3)", result: ""},
      //  {text: "%h(23)", result: ""}
    ];

    for(var i in testInput){
        var input = testInput[i];
        console.log("\n\n");
        console.log("Testing input ", input.text);
        var parsed = parser.parse(map, input.text);
        
        if(parsed !== input.result)
            throw "Expected: \n\t" + input.result +" \n but was: \n\t" + parsed;
        console.log("\n\nresult: ", parsed);
    }
    console.log("All passed!");
}

function teste2(){
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar2));
    grammar2.args = ["$arg1","$arg2","$arg3", "$arg4"];
    parser.feed('teste"%0"%1as%3\\dfa\\%2"sdfgdfg%3"%4');
    var results = parser.results[0];
    var result = "";
    for(var i in results){
        result += results[i].value;
    }
    console.log("result", result);
}

function testStylize(){
    const input = '%acumulado(%r[0]c[-1])*(sum(25)*(sum(9;8)/9)+3)*sum(7;a1:b1)';
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(stylegrammar));
    var html = "<!DOCTYPE html><html><head><style>"+
        ".r1c1, .a1b1{color:red}"+
        ".tk::before{content: ' '}"+
        ".tk::after{content: ' '}"+
        ".dynfml_{color:blue;}"+
        ".nb{color: orange}"+
        ".sep{color:black}"+
        ".op{color: green}"+
        ".fml_{color:blue}"+
        "</style></head><body>";
    var s = new Date().getTime();
    parser.feed(input);
    var results = parser.results[0];
    for(var i in results){
        html += results[i].text;
    }
    var e = new Date().getTime();
    console.log(e-s);
    console.log(html + "</body></html>");
}

test();

