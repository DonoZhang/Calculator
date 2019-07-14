/*
  1. 每输入一个.number，把operator push 到 expression，lastOperator更新为operator, operator重置为''；需保证最终表达式没有多余的0
  （比如0开头）的情况，以对eval函数友好；还要保证小数点不重复输入: 只要operand.indexof('.') > -1，则不作操作（不重复输入小数点）；
   如果两条都满足，则：
     - 更新operand，并实时更新显示在.result中；
  2. 每输入一个运算符，则把operand push到expression，operand 重置为''，并更新operator, 判断（比较operator和lastOperator 优先级），
        - 如果此时满足运算条件（operator优先级 >= lastOperator优先级（自定义一个operatorCompare function）），则运算expression，
          并把运算结果显示到.result，并把expression reset成[运算值]；
    
    -calculate 函数：在运算expression时，先判断indexof "🕑" 是否>-1： 
        - 如果是，则取得x = times前一位，y = times后一位，并把这相邻三位更新为'', Math.pow(x, y), 和 ''; 注意这里Math.pow直接运算出结果（因为优先级最高）
        然后把expression转换为字符串
        然后把字符串里的不标准运算符都换成标准运算符（比如÷换成/）
        然后eval
  3. 每输入一个=，按照上面满足运算条件操作
  4. clear: document.querySelector('.result').innerHTML = 0; operator = '', expression = [0], operand = '', 
     lastOperator = '';
*/

//只有输入新操作数才会把operator push 到expression、更新lastOperator（确定下来）；只有输入新操作符或等号才会把operand push到expression
/*---------------------------------------------model---------------------------------------------*/
var operator = '';
var expression = [0];
var operand = '';
var lastOperator = ''; //判断优先级用

/*--------------------------------------------control--------------------------------------------*/
//事件代理
document.querySelector('table').addEventListener('click',function(event){
    var value = event.target.innerHTML;
    work(value);
});

//监听键盘
document.addEventListener('keydown', function(event){
    var value;
    //如果是数字
    if(!event.shiftKey && event.keyCode >= 48 && event.keyCode <= 57){
        value = event.keyCode - 48 + "";
    }

    //如果是小数点
    if(!event.shiftKey && event.keyCode == 190){
        value = '.';
    }

    //如果是^
    if(event.shiftKey && event.keyCode == 54){
        value = '🕑';
    }

    //加减乘除
    if(!event.shiftKey && event.keyCode == 191){
        value = '÷';
    }
    if(event.shiftKey && event.keyCode == 56){
        value = '×';
    }
    if(!event.shiftKey && event.keyCode == 189){
        value = '−';
    }
    if(event.shiftKey && event.keyCode == 187){
        value = '+';
    }

    //等于
    if(!event.shiftKey && (event.keyCode == 187 || event.keyCode == 13 || event.keyCode == 32)){
        value = '=';
    }

    //clear
    if(!event.shiftKey && (event.keyCode == 27 || event.keyCode == 8)){
        value = 'C';
    }

    work(value);
}); 


function work(value){
    switch(value){
        //数字或小数点
        //在下面三类情况，都要保证expression/operand中没有多余的0，否则后面的eval会报错
        case '9': 
        case '8': 
        case '7': 
        case '6': 
        case '5': 
        case '4': 
        case '3': 
        case '2': 
        case '1': 
        case '0': {
            //最长可以输入10个字符
            if(operand.length >= 10){
                break;
            }
            expression.push(operator);
            lastOperator = operator;
            operator = '';
            //要判断之前是不是刚按了等号；如果刚按了等号接着就输入数字就意味着开始下一轮运算，应该先清空expression
            //判断方法：看表达式最后是不是数字，或者表达式是不是Infinity, 如果是：
            if(expression.join('').length > 0 && (/[0-9]/.test(expression.join('')[expression.join('').length - 1]) || expression.join('') === 'Infinity')){
                expression = [];
            }
            //如果输入的是数字，要判断expression有效位是不是只有一位0；如果是，要先把expression清空，保证没有多余的0，以友好eval
            if(expression.join('') === '0'){
                expression = [];
            }
            //同理判断operand第一位是不是0，如果是，也要删除
            if(operand.length == 1 && operand[0] === '0'){
                operand = operand.slice(1);
            }
            operand += value;
            document.querySelector('.result').innerHTML = operand;
            break;
        }
        case '.': {
            //最长可以输入10个字符
            if(operand.length >= 10){
                break;
            }
            expression.push(operator);
            lastOperator = operator;
            operator = '';
            if(expression.join('').length > 0 && (/[0-9]/.test(expression.join('')[expression.join('').length - 1]) || expression.join('') === 'Infinity')){
                expression = [];
            }
            if(operand.indexOf('.') > -1){break;}//如果已经有了小数点，不做操作
            if(operand.length == 0){ operand += '0';}
            operand += value;
            document.querySelector('.result').innerHTML = operand;
            break;
        }
        //运算符
        case '🕑':
        case '÷':
        case '×':
        case '−':
        case '+':  {
            //推入并重置operand
            expression.push(operand);
            operand = '';
            //更新operator
            operator = value; 
            if(operatorCompare()){
                //执行并显示运算
                let result = calculate();
                if(result === "Overflow"){
                    document.querySelector('.result').innerHTML = result;
                    doClear();
                    break;
                }
                document.querySelector('.result').innerHTML = result;
                expression = [result];
            }
            break;
        }
        //等号
        case '=': {
            expression.push(operand);
            let result = calculate();
            if(result === "Overflow"){
                document.querySelector('.result').innerHTML = result;
                doClear();
                break;
            }
            doClear();
            document.querySelector('.result').innerHTML = result;
            expression = [result];
            break;
        }
        //clear
        case 'C': {
            doClear();
            document.querySelector('.result').innerHTML = 0; 
            break;
        }
        default:{}
    }
}

function doClear(){
    operator = ''; 
    expression = [0]; 
    operand = '';
    lastOperator = '';
}

//返回true进行运算
function operatorCompare(){
    //如果是加减，马上运算
    if(operator == '−' || operator == '+'){
        return true;
    }

    //如果是乘除，判断之前有没有低级运算，如果没有则马上运算
    if((operator == '×' || operator == '÷') && expression.indexOf('−') < 0 && expression.indexOf('+') < 0){
        return true;
    }

    //如果是乘方，判断之前有没有低级运算，如果没有则马上运算
    if(operator == '🕑' && expression.indexOf('−') < 0 && expression.indexOf('+') < 0  && expression.indexOf('×') < 0 && expression.indexOf('÷') < 0){
        return true;
    }

    return false;
}

function calculate(){
    var str;
    if(expression.indexOf('🕑') > -1){
        let index = expression.indexOf('🕑');
        let increment = 0;
        let x = expression[index - 1];
        expression[index - 1] = '';
        for(;;)
        {
            if(expression[index + 1 + increment] === ''){
                increment ++;
            }
            else{
                break;
            }
        }
        let y = expression[index + 1 + increment];
        expression[index + 1 + increment] = '';
        //直接运算出来
        expression[index] = Math.pow(x, y);
    }
    str = expression.join('');
    str = str.replace(/÷/g, '/');
    str = str.replace(/×/g, '*');
    str = str.replace(/−/g, '-');
    //+ 本类就是标准运算符所以不需要替换

    //最多显示10位
    var result = eval(str);
    if(result > 9999999999 || result < -999999999){
        return "Overflow";
    }
    str = result + "";
    str = str.slice(0, 10);
    return str;
}
