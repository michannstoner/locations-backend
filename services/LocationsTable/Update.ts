import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;

// helps insert data into the table
const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDB",
  };
  const requestBody = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  const locationId = event.queryStringParameters?.[PRIMARY_KEY]

  if (requestBody && locationId) {
    const requestBodyKey = Object.keys(requestBody)[0];
    const requestBodyValue = requestBody[requestBodyKey];

    const updateResult = await dbClient.update({
      TableName: TABLE_NAME,
      Key: {
        [PRIMARY_KEY]: locationId
      },
      UpdateExpression: 'set #zzzNew = : new',
      ExpressionAttributeValues: {
        ':new': requestBodyValue,
      },
      ExpressionAttributeNames: {
        '#zzzNew': requestBodyKey
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
    result.body = JSON.stringify(updateResult)
  }
  return result;
}

export { handler };