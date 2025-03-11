import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewService {
  private readonly dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });

  private readonly tableName = 'Reviews';

  // ✅ 상품 등록
  async createReview(createReviewDto: any, googleId: string) {
    const id = uuidv4();
    const item = {
      id,
      googleId,
      ...createReviewDto,
    };

    await this.dynamoDBClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
      }),
    );

    return item;
  }

  // ✅ 전체 상품 조회
  async getAllReviews() {
    const { Items } = await this.dynamoDBClient.send(
      new ScanCommand({ TableName: this.tableName }),
    );
    return Items ? Items.map((item) => unmarshall(item)) : [];
  }

  // ✅ 특정 상품 조회
  async getReviewById(id: string) {
    const { Item } = await this.dynamoDBClient.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
      }),
    );
    if (!Item) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return unmarshall(Item);
  }

  // ✅ 특정 사용자의 후기 조회
  async getReviewsByUser(googleId: string) {
    const { Items } = await this.dynamoDBClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'googleId-index',
        KeyConditionExpression: 'googleId = :googleId',
        ExpressionAttributeValues: marshall({ ':googleId': googleId }),
      }),
    );

    if (!Items || Items.length === 0) {
      throw new NotFoundException(`No reviews found for user ${googleId}`);
    }

    return Items.map((item) => unmarshall(item));
  }

  // ✅ 상품 수정 (DynamoDB 문법 오류 수정)
  async updateReview(id: string, updateReviewDto: any, userGoogleId: string) {
    const existingReview = await this.getReviewById(id);
    if (existingReview.googleId !== userGoogleId) {
      throw new BadRequestException(
        'You are not authorized to update this review',
      );
    }

    // ✅ UpdateExpression 및 ExpressionAttributeValues 수정
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(updateReviewDto)) {
      updateExpressionParts.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
    }

    const updateExpression = `set ${updateExpressionParts.join(', ')}`;

    await this.dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
      }),
    );

    return this.getReviewById(id);
  }

  // ✅ 상품 삭제
  async deleteReview(id: string, userGoogleId: string) {
    const existingReview = await this.getReviewById(id);
    if (existingReview.googleId !== userGoogleId) {
      throw new BadRequestException(
        'You are not authorized to delete this review',
      );
    }

    await this.dynamoDBClient.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
      }),
    );

    return { message: 'Review deleted successfully' };
  }

  // ✅ 특정 사용자의 모든 후기 삭제
  async deleteReviewsByUser(googleId: string) {
    const reviews = await this.getReviewsByUser(googleId);
    if (!reviews.length) {
      throw new NotFoundException(`No reviews found for user ${googleId}`);
    }

    for (const review of reviews) {
      await this.dynamoDBClient.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ id: review.id }),
        }),
      );
    }

    return { message: `Successfully deleted ${reviews.length} reviews.` };
  }
}
