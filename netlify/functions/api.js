const serverless = require('serverless-http');
const app = require('../../server');
const appHandler = serverless(app, { binary: ['image/*'] });

exports.handler = async (event, context) => {
  const { connectLambda } = await import('@netlify/blobs');
  connectLambda(event);
  return appHandler(event, context);
};
