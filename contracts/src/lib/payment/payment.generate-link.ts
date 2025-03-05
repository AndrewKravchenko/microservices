import { IsNumber, IsString } from 'class-validator';

export const PAYMENT_GENERATE_LINK_TOPIC = 'payment.generate-link.command';

export class PaymentGenerateLinkRequest {
  @IsString()
  courseId: string;

  @IsString()
  userId: string;

  @IsNumber()
  sum: number;
}

export class PaymentGenerateLinkResponse {
  paymentLink: string;
}
