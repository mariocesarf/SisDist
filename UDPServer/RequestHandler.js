export const descerializer = (msg) => {
    let arrayOfMsg = msg.trim().split("");
    return {
      op1 : parseInt(arrayOfMsg[0]),
      operator : arrayOfMsg[1],
      op2 : parseInt(arrayOfMsg[2])
    }
}

export const calcular = ( operation ) =>{
  switch(operation.operator){
    case "+":
      return operation.op1 + operation.op2;
    case "-":
      return operation.op1 - operation.op2;
    case "*":
      return operation.op1 * operation.op2;
    case "/":
      return operation.op1 / operation.op2;
  }
}