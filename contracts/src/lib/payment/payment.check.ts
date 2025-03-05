import { IsString } from 'class-validator';

export type PaymentStatus = 'canceled' | 'success' | 'progress';

export const PAYMENT_CHECK_TOPIC = 'payment.check.query';

export class PaymentCheckRequest {
  @IsString()
  courseId: string;

  @IsString()
  userId: string;
}

export class PaymentCheckResponse {
  status: PaymentStatus ;
}
