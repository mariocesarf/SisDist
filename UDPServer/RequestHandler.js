const findOperator = (operation) => {
  if (operation.includes("+")) return "+";
  if (operation.includes("-")) return "-";
  if (operation.includes("*")) return "*";
  if (operation.includes("/")) return "/";
};

const formatMenssage = (message) => {
  return message.trim().replace(",", ".").replace(/\s/g, "");
};

export const descerializer = (msg) => {
  let formatedMessage = formatMenssage(msg);
  let operator = findOperator(formatedMessage);
  let [op1, op2] = formatedMessage.split(operator);
  return {
    op1: op1.includes(".") ? parseFloat(op1) : parseInt(op1),
    operator,
    op2: op2.includes(".") ? parseFloat(op2) : parseInt(op2),
  };
};

export const calcular = (operation) => {
  let result = 0;
  switch (operation.operator) {
    case "+":
      result = operation.op1 + operation.op2;
      break;
    case "-":
      result = operation.op1 - operation.op2;
      break;
    case "*":
      result = operation.op1 * operation.op2;
      break;
    case "/":
      result =
        operation.op2 !== 0 ? operation.op1 / operation.op2 : "MATH ERROR";
      //return result;
      break;
  }
  if(typeof(result)==Number){
  return result.toFixed(2).toString();
  }else{
    return result;

  }
  
  
};
