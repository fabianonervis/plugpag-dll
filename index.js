const koffi = require('koffi');
const fs = require('fs');
const path = require('path');

const APP_NAME = `NOME APP`;
const APP_VERSION = `1.0.0`;
const PORT = `COM4`;

const arqLib = path.resolve('PPPagSeguro.dll');

if(!fs.existsSync(arqLib)){
  console.log(`Arquivo ${arqLib} não encontrado`)
}

const lib = koffi.load(arqLib);

//Estrutura do retorno de pagamento
const TransactionResult = koffi.struct('TransactionResult', {
  rawBuffer: koffi.array('char', 65543, 'String'),
  message: koffi.array('char', 1024, 'String'),
  transactionCode: koffi.array('char', 33, 'String'),
  date: koffi.array('char', 11, 'String'),
  time: koffi.array('char', 9, 'String'),
  hostNsu: koffi.array('char', 13, 'String'),
  cardBrand: koffi.array('char', 31, 'String'),
  bin: koffi.array('char', 7, 'String'),
  holder: koffi.array('char', 5, 'String'),
  userReference: koffi.array('char', 11, 'String'),
  terminalSerialNumber: koffi.array('char', 66, 'String')
});

//Funções da DLL
const PlugPag = {
  initBTConnection : lib.stdcall('InitBTConnection', 'int', ['str']),
  setVersionName : lib.stdcall('SetVersionName', 'int', ['str','str']),
  simplePaymentTransaction: lib.func('int __stdcall SimplePaymentTransaction(int paymentMethod, int installmentType, int installment, str amount, str reference, _Out_ TransactionResult *res)')
};

//Valores fixos para teste
const paymentMethod = 1; //enum {PPPAGSEGURO_CREDIT = 1, PPPAGSEGURO_DEBIT = 2, PPPAGSEGURO_VOUCHER = 3}
const installmentType = 1; //enum {PPPAGSEGURO_A_VISTA = 1, PPPAGSEGURO_PARC_VENDEDOR = 2}
const installment = 1; //Número de parcelas - À VISTA = 1
const amount = `1237`; //Valor * 100 EXEMPLO = R$ 12,00 deve considerar 1200
const reference = `12`; //Código da venda definida pela aplicação

//Define o nome e versão do app, obrigatório antes de cada operação
console.log(`SetName: ${PlugPag.setVersionName(APP_NAME, APP_VERSION)}`);

//Inicializar Bluetooth - NÃO RETORNA ERRO O ERRO É MOSTRADO SOMENTE NA HORA DA OPERAÇÃO
console.log(`Init: ${PlugPag.initBTConnection(PORT)}`);

let resultTransaction = {};
//ENVIA VALOR DA VENDA PARA A MAQUINA
PlugPag.simplePaymentTransaction.async(paymentMethod, installmentType, installment, amount, reference, resultTransaction, (err, res) => {
  console.log(err);
  console.log(res);
})