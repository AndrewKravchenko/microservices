import { PurchaseState } from '@purple/interfaces';
import { IsString } from 'class-validator';

export const ACCOUNT_CHANGED_COURSE_TOPIC = 'account.changed-course.event';

export class AccountChangedCourseRequest {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;

  @IsString()
  state: PurchaseState;
}
