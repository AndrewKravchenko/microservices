import { IsString } from 'class-validator';
import { PaymentStatus } from '../payment/payment.check';

export const ACCOUNT_CHECK_PAYMENT_TOPIC = 'account.check-payment.command';

export class AccountCheckPaymentRequest {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;
}

export class AccountCheckPaymentResponse {
  status: PaymentStatus;
}
