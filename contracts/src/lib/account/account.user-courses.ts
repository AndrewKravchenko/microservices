import { IUserCourses } from '@purple/interfaces';
import { IsString } from 'class-validator';

export const ACCOUNT_USER_COURSES_TOPIC = 'account.user-courses.query';

export class AccountUserCoursesRequest {
  @IsString()
  id: string;
}

export class AccountUserCoursesResponse {
  courses: IUserCourses[];
}
