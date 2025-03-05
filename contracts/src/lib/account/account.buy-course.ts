import { IsString } from 'class-validator';

export const ACCOUNT_BUY_COURSE_TOPIC = 'account.check-payment.command';

export class AccountBuyCourseRequest {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;
}

export class AccountBuyCourseResponse {
  paymentLink: string;
}
