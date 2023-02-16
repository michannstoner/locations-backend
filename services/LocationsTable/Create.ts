// a lambda that inserts data into a dynamodb table

import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { v4 } from "uuid";

const TABLE_NAME = process.env.TABLE_NAME;

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
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item.locationId = v4();

  try {
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();
  } catch (error: any) {
    result.body = error.message;
  }
  result.body = JSON.stringify(item.locationId);
  return result;
}

export { handler };
