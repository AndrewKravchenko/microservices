import { ICourse } from '@purple/interfaces';
import { IsString } from 'class-validator';

export const COURSE_GET_COURSE_TOPIC = 'course.get-course.query';

export class CourseGetCourseRequest {
  @IsString()
  id: string;
}

export class CourseGetCourseResponse {
  course: ICourse | null;
}
