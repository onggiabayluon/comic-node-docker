const https = require('https');
const crypto = require('crypto');

const createPayment = (partnerCode, accessKey, secretkey, amount, redirectUrl, ipnUrl, orderInfo, extraData) => {
  return new Promise((resolve, reject) => {
    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId;
    const requestType = 'captureWallet';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretkey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'en'
    });

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, res => {
      let responseData = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        responseData += chunk;
      });
      res.on('end', () => {
        const responseJson = JSON.parse(responseData);
        if (responseJson.resultCode === 0) {
          resolve(responseJson.payUrl);
        } else {
          reject(new Error(`Error code ${responseJson.resultCode}: ${responseJson.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
};

module.exports = {
  createPayment
};
