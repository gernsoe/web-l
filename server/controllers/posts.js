import Parser from 'tree-sitter';
import L from 'tree-sitter-l';

export const createPost = async (req, res) => {
    try {
        const parser = new Parser();
        parser.setLanguage(L);

        var memory = new Int32Array(10);
        var registers = {
            "$!":0, //PC
            "$?":0, //Bool
            "$x":0,
            "$y":0,
            "$j":0
        }

        async function get_reader_type(reader){

            if(reader.childCount == 0){
                return '_';
            } else if(reader.child(0).type == 'assign'){
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
                    break;//not done
                case 'data':
                    break;//not done
                case 'label':
                    break;//not done
                case '_':
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
                    return 0;
                    //return v_left | v_right;
                case '&':
                    return 0;
                    //return v_left & v_right;
            }
            console.log(console.error("reeee"));
            throw new Error("Operator:",oper," unknown")
        }

        // function handle_unary(oper,v){
        //     switch(oper.text){
        //         case '-':
        //         case '&':
        //         case ''
        //     }
        // }

        async function handle_expression(expression){
            var numOfChildren = expression.childCount;
            switch(numOfChildren){
                case 1: // reader
                    return await handle_reader(expression.child(0));
                case 2: // oper, reader
                    return await handle_unary(expression.child(0),await handle_reader(expression.child(1)));
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

        function handle_syscall(s){
            return 0;
        }

        async function handle_statement(statement){
            if(statement.childCount == 1){ //Syscall is the only statement which has only 1 child node
                await handle_syscall(statement.child(0));
            }else{
                if(statement.child(1).type.toString() == ':='){
                    await handle_writer(statement);
                }else if(statement.child(1).type.toString() == '?='){
                    if(registers['$?']){ 
                        await handle_writer(statement);
                    }
                }
            }
        }

        async function execute_statements(statements){
            let instructions = new Array();
            for(let c_i = 0; c_i < statements.childCount; c_i++){
                var statement = statements.child(c_i);
                switch(statement.type){
                    case 'statement':
                        instructions.push(statement);
                        break;
                    case ';':
                        break;
                    case ' ':
                        break;
                }
            }   

            while(true){
                await handle_statement(instructions[registers['$!']])
                registers['$!']++;
                if(registers['$!'] >= instructions.length){
                    break;
                }
            }
        }

        async function execute(sourceCode){
            var tree = parser.parse(sourceCode);
            const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
            const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);

            await execute_statements(statements);
            return JSON.stringify(await registers, 2);
        }
        var result = await execute(req.body.code);
        console.log("Resolved request and updated registers: ", result);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}