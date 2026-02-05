import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@repo/db/types';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) { }

  /**
   * Validates if teacher can use Förderung (sponsor) payment method
   * Requirements:
   * 1. Teacher must have attended Info-Webinar for current school year
   * 2. Admin must have approved Förderung for teacher in current school year
   */
  async validateForderungUsage(teacherId: string, schoolYearId: string): Promise<{
    canUse: boolean;
    reason?: string;
  }> {
    // Get current school year
    const schoolYear = await this.prisma.client.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!schoolYear) {
      throw new BadRequestException('School year not found');
    }

    // Check Info-Webinar attendance for current school year
    // Info-Webinar events that fall within the school year
    const schoolYearStart = schoolYear.startDate;
    const schoolYearEnd = schoolYear.endDate;

    const attendedWebinar = await this.prisma.client.calendlyEventAttendee.findFirst({
      where: {
        userId: teacherId,
        attended: true,
        event: {
          startTime: {
            gte: schoolYearStart,
            lte: schoolYearEnd,
          },
        },
      },
    });

    if (!attendedWebinar) {
      return {
        canUse: false,
        reason: 'Info-Webinar für das aktuelle Schuljahr nicht besucht. Bitte besuche zuerst ein Info-Webinar.',
      };
    }

    // Check Förderung approval for current school year
    const forderungApproval = await this.prisma.client.teacherForderungApproval.findUnique({
      where: {
        teacherId_schoolYearId: {
          teacherId,
          schoolYearId,
        },
      },
    });

    if (!forderungApproval || !forderungApproval.approved) {
      return {
        canUse: false,
        reason: 'Förderung für das aktuelle Schuljahr nicht freigegeben. Bitte wende dich an den Administrator.',
      };
    }

    return { canUse: true };
  }

  async createClass(
    teacherId: string,
    data: {
      name: string;
      grade?: string;
      designation?: string;
      schoolId: string;
      estimatedStudents?: number;
      paymentMethod: 'license' | 'sponsor' | 'invoice' | 'uew';
      coursePackageIds: string[];
    },
  ) {
    // Get current school year
    const currentSchoolYear = await this.prisma.client.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSchoolYear) {
      throw new BadRequestException('No current school year found');
    }

    // Validate teacher
    const teacher = await this.prisma.client.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== UserRole.teacher) {
      throw new ForbiddenException('User is not a teacher');
    }

    // Validate payment method
    if (data.paymentMethod === 'sponsor') {
      const validation = await this.validateForderungUsage(teacherId, currentSchoolYear.id);
      if (!validation.canUse) {
        throw new BadRequestException(validation.reason);
      }
    }

    // Create class
    const newClass = await this.prisma.client.class.create({
      data: {
        name: data.name,
        grade: data.grade,
        designation: data.designation,
        schoolId: data.schoolId,
        schoolYearId: currentSchoolYear.id,
        primaryTeacherId: teacherId,
        estimatedStudents: data.estimatedStudents,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'sponsor' || data.paymentMethod === 'license' ? 'free' : 'pending',
      },
    });

    // Assign course packages
    if (data.coursePackageIds.length > 0) {
      await Promise.all(
        data.coursePackageIds.map((coursePackageId) =>
          this.prisma.client.classCoursePackage.create({
            data: {
              classId: newClass.id,
              coursePackageId,
              schoolYearId: currentSchoolYear.id,
              licenseCount: 0,
            },
          }),
        ),
      );
    }

    // Generate students if estimatedStudents is provided
    const students: Array<{ user: any; password: string }> = [];
    if (data.estimatedStudents && data.estimatedStudents > 0) {
      for (let i = 0; i < data.estimatedStudents; i++) {
        const password = this.generateStudentPassword();
        const studentPasswordHash = await bcrypt.hash(password, 10);

        const student = await this.prisma.client.user.create({
          data: {
            firstName: `Schüler`,
            lastName: `${i + 1}`,
            role: UserRole.student,
            classId: newClass.id,
            schoolId: data.schoolId,
            studentPasswordHash,
            studentPasswordPlain: password, // Store plain password for teacher display
          },
        });

        // Give each student 1 T!Coin as initial balance
        await this.prisma.client.tCoinsTransaction.create({
          data: {
            userId: student.id,
            schoolYearId: currentSchoolYear.id,
            transactionType: 'earn',
            amount: 1,
            balanceAfter: 1,
            sourceType: 'manual',
            sourceDescription: 'Startguthaben',
          },
        });

        students.push({
          user: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
          },
          password,
        });
      }
    }

    return {
      class: newClass,
      students,
    };
  }

  private generateStudentPassword(): string {
    const length = 12;
    // Exclude confusing characters: 0, O, 1, l, I
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
    let password = '';

    // Use crypto.randomBytes for better security
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }

    return password;
  }

  async getClasses(teacherId: string) {
    const currentSchoolYear = await this.prisma.client.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSchoolYear) {
      return [];
    }

    const classes = await this.prisma.client.class.findMany({
      where: {
        schoolYearId: currentSchoolYear.id,
        OR: [
          { primaryTeacherId: teacherId },
          {
            teachers: {
              some: {
                teacherId,
              },
            },
          },
        ],
      },
      include: {
        students: {
          where: {
            isActive: true,
          },
        },
        schoolYear: true,
        coursePackages: {
          include: {
            coursePackage: true,
          },
        },
      },
    });

    // Calculate stats for each class
    return Promise.all(
      classes.map(async (classItem) => {
        const studentIds = classItem.students.map((s) => s.id);
        const studentCount = studentIds.length;

        // Get TCoins for current school year
        const tCoinsTransactions = await this.prisma.client.tCoinsTransaction.findMany({
          where: {
            userId: { in: studentIds },
            schoolYearId: currentSchoolYear.id,
            transactionType: 'earn',
          },
        });

        const totalTCoins = tCoinsTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        const tScore = studentCount > 0 ? totalTCoins / studentCount : 0;

        // Get project count
        const projectCount = await this.prisma.client.project.count({
          where: {
            authorId: { in: studentIds },
          },
        });

        // Get certificate count
        const certificateCount = await this.prisma.client.userCertificate.count({
          where: {
            userId: { in: studentIds },
          },
        });

        return {
          ...classItem,
          stats: {
            studentCount,
            totalTCoins,
            tScore: Number(tScore.toFixed(2)),
            projectCount,
            certificateCount,
          },
        };
      }),
    );
  }

  async getClassById(classId: string, teacherId: string) {
    const classItem = await this.prisma.client.class.findFirst({
      where: {
        id: classId,
        OR: [
          { primaryTeacherId: teacherId },
          {
            teachers: {
              some: {
                teacherId,
              },
            },
          },
        ],
      },
      include: {
        students: {
          where: {
            isActive: true,
          },
        },
        school: true,
        schoolYear: true,
        coursePackages: {
          include: {
            coursePackage: true,
          },
        },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!classItem) {
      throw new ForbiddenException('Class not found or access denied');
    }

    // Calculate stats
    const studentIds = classItem.students.map((s) => s.id);
    const studentCount = studentIds.length;

    // Get current school year
    const currentSchoolYear = await this.prisma.client.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    let totalTCoins = 0;
    let projectCount = 0;
    let certificateCount = 0;

    if (currentSchoolYear && studentIds.length > 0) {
      // Get TCoins for current school year
      const tCoinsTransactions = await this.prisma.client.tCoinsTransaction.findMany({
        where: {
          userId: { in: studentIds },
          schoolYearId: currentSchoolYear.id,
          transactionType: 'earn',
        },
      });

      totalTCoins = tCoinsTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

      // Get project count
      projectCount = await this.prisma.client.project.count({
        where: {
          authorId: { in: studentIds },
        },
      });

      // Get certificate count
      certificateCount = await this.prisma.client.userCertificate.count({
        where: {
          userId: { in: studentIds },
        },
      });
    }

    const tScore = studentCount > 0 ? totalTCoins / studentCount : 0;

    return {
      ...classItem,
      stats: {
        studentCount,
        totalTCoins,
        tScore: Number(tScore.toFixed(2)),
        projectCount,
        certificateCount,
      },
    };
  }

  async getAvailableCoursePackages(teacherId: string) {
    // Get teacher's school
    const teacher = await this.prisma.client.user.findUnique({
      where: { id: teacherId },
      include: { school: true },
    });

    if (!teacher || !teacher.schoolId) {
      return [];
    }

    // Get current school year
    const currentSchoolYear = await this.prisma.client.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSchoolYear) {
      return [];
    }

    // Get all active and available course packages
    return this.prisma.client.coursePackage.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });
  }
}
