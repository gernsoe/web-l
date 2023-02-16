import Parser from 'tree-sitter';
import L from 'tree-sitter-l';

const parser = new Parser();
parser.setLanguage(L);

var registers = {
    "$!":0, //PC
    "$?":0, //Bool
    "$x":0,
    "$y":0,
    "$j":0
};

var instructions = {};

async function init_registers() {
    for (let key in registers) {
        registers[key] = 0;
    }
}

async function clear_instructions()  {
    instructions = {};
}

async function get_reader_type(reader){
    if(reader.child(0).type == 'assign'){
        return reader.child(0).child(0).type;
    } else {
        return reader.child(0).type;
    }
}

async function handle_reader(reader){
    var reader_content = reader.text;
    var reader_type = await get_reader_type(reader);
    switch(reader_type){
        case 'register':
            if (reader_content in registers){
                return registers[reader_content];
            }else{
                throw new Error("Register ",reader_content," not found")
            }
        case 'memory':
            break;//not done
        case 'constant':
            if (reader_content in constants){
                return constants[reader_content];
            }else{
                throw new Error("Constant ",reader_content," not found")
            }
        case 'data':
            break;//not done
        case 'label':
            if (reader_content in labels){
                return labels[reader_content];
            }else{
                throw new Error("Label ",reader_content," not found")
            }
        case 'number'://does not work with strings atm.
            return parseInt(reader_content);
    }
}

async function handle_binary(v_left,oper,v_right){
    switch(oper.text){
        case '+':
            return v_left + v_right;
        case '-':
            return v_left - v_right;
        case '*':
            return v_left * v_right;
        case '/':
            return v_left / v_right;
        case '|':
            return v_left || v_right ;
        case '&':
            return v_left && v_right;
        case '>':
            return v_left > v_right;
        case '<':
            return v_left < v_right;
        case '=':
            return v_left == v_right;
    }
    console.log(console.error("reeee"));
    throw new Error("Operator:",oper," unknown")
}

async function handle_unary(oper,v){
    switch(oper.text){
        case '-':
            return -v;
        case '&':
            return 0; //Not implemented
    }
}

async function handle_expression(expression){
    var numOfChildren = expression.childCount;
    switch(numOfChildren){
        case 1: // reader
            return await handle_reader(expression.child(0));
        case 2: // oper, reader
            return await handle_unary(expression.child(0),handle_reader(expression.child(1)));
        case 3: // reader, oper, reader
            return await handle_binary(await handle_reader(expression.child(0)), expression.child(1), await handle_reader(expression.child(2)))
    }
}

async function handle_writer(statement){
    var writer = statement.child(0).child(0).child(0);
    var expression = statement.child(2); 
    switch(writer.type){
        case 'memory':
            break;
        case 'register':
            registers[writer.text.toString()] = await handle_expression(expression);
    }
}

async function handle_syscall(s){
    return 0;
}

async function handle_statement(statement){
    if(statement.childCount == 1 && statement.text == 'syscall'){
        await handle_syscall(statement.child(0));
    }else{
        if(statement.child(1).type.toString() == ':='){
            await handle_writer(statement);
        }else if(statement.child(1).type.toString() == '?='){
            if(registers['$?']){//TODO: FIX 
                await handle_writer(statement);
            }
        }
    }
}


async function read_statements(statements){
    let instructions = new Array();
    let l_pc = 0;
    for(let c_i = 0; c_i < statements.childCount; c_i++){
        let statement = statements.child(c_i);
        switch(statement.type){
            case 'label':
                labels[statement.text] = l_pc;
                break;
            case 'statement':
                instructions.push(statement);
                l_pc++;
                break;
            case ';':
                break;
            case ' ':
                break;
        }
    }
    
    return instructions;
}

async function handle_declaration(declaration){
    let type = declaration.child(0).text;
    let dec = declaration.child(1).text.split(' ');
    // console.log(type)
    // console.log(dec[0])
    // console.log(dec[1])
    if(type == 'const'){
        constants[dec[0]] = dec[1];
    }else if(type == 'data'){
        data[dec[0]] = dec[1];
    }
}

async function read_declarations(declarations){
    for(let c_i = 0; c_i < declarations.childCount; c_i++){
        let declaration = declarations.child(c_i);
        switch(declaration.type){
            case 'declaration':
                await handle_declaration(declaration);
                break;
            case ';':
                break;
            case ' ':
                break;
        }
    }               
}

async function read_program(tree){
    if(tree.rootNode.toString().includes("ERROR")){
        console.log("Syntax Error, see parse below:");
        console.log(tree.rootNode.toString());
        return;
    }
    const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
    const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);
    await read_declarations(declarations)
    let instructions = await read_statements(statements);
    return instructions;
}

export async function execute_all(code){
    await init(code);
    while(true){ //step
        await handle_statement(instructions[registers['$!']])
        registers['$!']++;
        if(registers['$!'] >= instructions.length){
            break;
        }
    }
    return JSON.stringify(await registers, 2);
}

export async function execute_step(){
    if(registers['$!'] >= instructions.length){
        console.log("EOF");
        return JSON.stringify(await registers, 2);
    }
    await handle_statement(instructions[registers['$!']])
    registers['$!']++;
    console.log("registers: ",JSON.stringify(await registers, 2)); 
    return JSON.stringify(await registers, 2);
}

export async function enterDebugMode(code) {
    await init(code);
    return JSON.stringify(await registers, 2);
}

async function init(code) {
    await init_registers();
    const tree = parser.parse(code);
    await clear_instructions();
    instructions = await read_program(tree);
}