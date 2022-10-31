
const algosdk = require('algosdk'); 
const prompt = require('prompt-sync')();  

// open a Purestake API and get a unique API KEY
const server = "https://testnet-algorand.api.purestake.io/ps2";
const port = "";
const token = {
  "X-API-Key": "rquTzT7gdxaQhjTBaVM6g5PFfWMPc5mY7vR4Jt0k", 
};
const algodClient = new algosdk.Algodv2(token, server, port); 

// create a testnet account with myalgowallet, keep the mmemonic key
const mnemonic = "net boring toe inspire forest copper denial solar quote blur inquiry film cook spray exist mutual defy because next ten gadget scheme rocket able cheese";

// get account from mmemonic key
const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic); 

// choice coin asset ID
const ASSET_ID = 21364625

const voting_address = "KKASG2RHLED5UOLR5SYZTHP2BCENMWN5CUFG5U7KKPSG6M2YUZYMRWYSOQ"

// Input 1 to vote for candidate one and 0 to vote for candidate Zero

const chooseVotingOption = async () => {
    const candidateOption = prompt("Press 0 for candidate Zero or Press 1 for candidate One:") 
     const amount = prompt("Please enter Amount to commit to voting:");
    const params =  await algodClient.getTransactionParams().do(); 
    const encoder = new TextEncoder();  

    // if there is no valid option
    if (!(candidateOption)) {
        console.log('Please select a valid candidate option');
    } else if (!Number(amount)) {
        console.log("Please Enter A valid Choice token amount to vote")
    }
    else  if (candidateOption == "0") {
            try {
                let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                    recoveredAccount.addr,
                    voting_address,
                    undefined,
                    undefined,
                    Number(amount),
                    encoder.encode("Voting with Choice coin"),
                    ASSET_ID,
                    params

                )

            let signedTxn = txn.signTxn(recoveredAccount.sk);
            const response =  await algodClient.sendRawTransaction(signedTxn).do();
            if(response) {
                console.log(`You just voted for candidate Zero,Your voting ID: ${response.txId}`);
                // wait for confirmation
                waitForConfirmation(algodClient, response.txId);
            } else {
                console.log('error voting for candidate Zero, try again later')
            }

        } catch(error) {
            console.log("error voting for candidate Zero, Try again later");
        }

 } else  if(candidateOption == "1"){
    try {
        let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            recoveredAccount.addr,
            voting_address,
            undefined,
            undefined,
            Number(amount),
            encoder.encode("Voting with Choice coin"),
            ASSET_ID,
            params
        )
        let signedTxn = txn.signTxn(recoveredAccount.sk);
        const response =  await algodClient.sendRawTransaction(signedTxn).do();
        if(response) {
            console.log(`You just voted for candidate One,Your voting ID: ${response.txId}`);
            // wait for confirmation
            waitForConfirmation(algodClient, response.txId);
        } else {
            console.log('error voting for candidate one, try again later')
        }

    } catch(error) {
        console.log("Error voting for candidate One, Try again later");
    }
    }
}

chooseVotingOption();

// verification function
const waitForConfirmation = async function (algodClient, txId) {
    let lastround = (await algodClient.status().do())['last-round'];
     while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
          console.log('Voting confirmed in round ' + pendingInfo['confirmed-round']);
          break;
        }
        lastround++;
        await algodClient.statusAfterBlock(lastround).do();
     }
 };


// check account balance
const checkBalance = async () => {
    const accountInfo =  await algodClient.accountInformation(recoveredAccount.addr).do();
    const assets =  accountInfo["assets"];

    // get choice amount from assets
    assets.map(asset => {
        if (asset['asset-id'] === ASSET_ID) {
            const amount = asset["amount"];
            const choiceAmount = amount / 100;
            console.log(
                `Account ${recoveredAccount.addr} has ${choiceAmount} $choice`
              );
              return;
        }  else {
            console.log(`Account ${recoveredAccount.addr} must opt in to Choice Coin Asset ID ${ASSET_ID}`);
         }
    })
};

checkBalance();