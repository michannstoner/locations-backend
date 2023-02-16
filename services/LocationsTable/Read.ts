import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

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

  try {
    if (event.queryStringParameters) {
      result.body = await queryWithPrimaryPartition(event.queryStringParameters)
    } else {
      result.body = await scanTable();
    }
  } catch (error: any) {
    result.body = error.message;
  }
  return result;
}

async function queryWithPrimaryPartition(params: APIGatewayProxyEventQueryStringParameters) {
        const parameter = params[PRIMARY_KEY!];
        const queryResponse = await dbClient.query({
          TableName: TABLE_NAME!,
          KeyConditionExpression: '#zz = :zzzz',
          ExpressionAttributeNames: {
            '#zz': PRIMARY_KEY!,
          },
          ExpressionAttributeValues: {
            ':zzzz': parameter
          }
        }).promise();
        return JSON.stringify(queryResponse.Items);
}

async function scanTable() {
  const queryResponse = await dbClient
        .scan({
          TableName: TABLE_NAME!,
        })
        .promise();
      return JSON.stringify(queryResponse.Items);
}

export { handler };
