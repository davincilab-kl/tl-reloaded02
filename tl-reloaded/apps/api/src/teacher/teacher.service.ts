import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@repo/db/types';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        school: true,
      },
    });

    if (!user || user.role !== UserRole.teacher) {
      throw new Error('User is not a teacher');
    }

    // Get current school year
    const currentSchoolYear = await this.prisma.client.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    // Get classes for current school year
    const classes = await this.prisma.client.class.findMany({
      where: {
        schoolId: user.schoolId || undefined,
        schoolYearId: currentSchoolYear?.id,
        OR: [
          { primaryTeacherId: userId },
          {
            teachers: {
              some: {
                teacherId: userId,
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
          where: {
            schoolYear: {
              isCurrent: true,
            },
          },
          include: {
            coursePackage: true,
          },
        },
      },
    });

    // Calculate statistics for each class
    const classesWithStats = await Promise.all(
      classes.map(async (classItem) => {
        // Get T!Coins for current school year
        const tCoinsTransactions = await this.prisma.client.tCoinsTransaction.findMany({
          where: {
            userId: {
              in: classItem.students.map((s) => s.id),
            },
            schoolYearId: currentSchoolYear?.id,
            transactionType: 'earn',
          },
        });

        const totalTCoins = tCoinsTransactions.reduce((sum, t) => sum + t.amount, 0);
        const studentCount = classItem.students.length;
        const tScore = studentCount > 0 ? totalTCoins / studentCount : 0;

        // Get project count
        const projectCount = await this.prisma.client.project.count({
          where: {
            classId: classItem.id,
          },
        });

        // Get certificate count
        const certificateCount = await this.prisma.client.userCertificate.count({
          where: {
            user: {
              classId: classItem.id,
            },
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

    // Get pending project reviews
    const pendingProjects = await this.prisma.client.project.findMany({
      where: {
        status: 'submitted_for_review',
        class: {
          schoolId: user.schoolId || undefined,
        },
      },
      include: {
        author: true,
        class: true,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check Info-Webinar attendance for current school year
    let attendedWebinar: any = null;
    let forderungApproval: any = null;

    if (currentSchoolYear) {
      const schoolYearStart = currentSchoolYear.startDate;
      const schoolYearEnd = currentSchoolYear.endDate;

      attendedWebinar = await this.prisma.client.calendlyEventAttendee.findFirst({
        where: {
          userId: user.id,
          attended: true,
          event: {
            startTime: {
              gte: schoolYearStart,
              lte: schoolYearEnd,
            },
          },
        },
        include: {
          event: true,
        },
      });

      // Check Förderung approval for current school year
      forderungApproval = await this.prisma.client.teacherForderungApproval.findUnique({
        where: {
          teacherId_schoolYearId: {
            teacherId: user.id,
            schoolYearId: currentSchoolYear.id,
          },
        },
      });
    }

    // Get course packages
    const classCoursePackages = await this.prisma.client.classCoursePackage.findMany({
      where: {
        class: {
          schoolId: user.schoolId || undefined,
          schoolYear: {
            isCurrent: true,
          },
          OR: [
            { primaryTeacherId: userId },
            {
              teachers: {
                some: {
                  teacherId: userId,
                },
              },
            },
          ],
        },
      },
      include: {
        coursePackage: {
          include: {
            courses: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    const coursePackages = classCoursePackages.map((ccp) => ccp.coursePackage);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      school: user.school
        ? {
            id: user.school.id,
            name: user.school.name,
            schoolCode: user.school.schoolCode,
            freeLicensesEnabled: user.school.freeLicensesEnabled,
          }
        : null,
      classes: classesWithStats.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        designation: c.designation,
        stats: c.stats,
      })),
      pendingProjects: pendingProjects.map((p) => ({
        id: p.id,
        title: p.title,
        author: {
          id: p.author.id,
          firstName: p.author.firstName,
          lastName: p.author.lastName,
        },
        class: p.class
          ? {
              id: p.class.id,
              name: p.class.name,
            }
          : null,
        createdAt: p.createdAt.toISOString(),
      })),
      coursePackages: coursePackages.map((cp) => ({
        id: cp.id,
        title: cp.title,
        description: cp.description,
      })),
      currentSchoolYear: currentSchoolYear
        ? {
            id: currentSchoolYear.id,
            name: currentSchoolYear.name,
            startDate: currentSchoolYear.startDate.toISOString(),
            endDate: currentSchoolYear.endDate.toISOString(),
          }
        : null,
      infoWebinar: {
        attended: !!attendedWebinar,
        attendedAt: attendedWebinar ? attendedWebinar.event?.startTime?.toISOString() || null : null,
      },
      forderungApproval: {
        approved: forderungApproval ? forderungApproval.approved : false,
        approvedAt: forderungApproval?.approvedAt?.toISOString() || null,
        canUseForderung: !!(attendedWebinar && forderungApproval && forderungApproval.approved),
      },
    };
  }
}
