import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@repo/db/types';

@Injectable()
export class DemoClassService {
    constructor(private prisma: PrismaService) { }

    async createDemoClassForTeacher(teacherId: string, schoolId: string) {
        // Fetch the first active school year
        const schoolYear = await this.prisma.client.schoolYear.findFirst({
            where: { isActive: true },
        }) || await this.prisma.client.schoolYear.findFirst();

        if (!schoolYear) throw new Error('No school year found');

        // 1. Create the class
        const demoClass = await this.prisma.client.class.create({
            data: {
                name: 'Demo-Klasse 1',
                schoolId,
                schoolYearId: schoolYear.id,
                primaryTeacherId: teacherId,
            },
        });

        // 2. Create 3 demo students
        const demoStudents = [
            { firstName: 'Lukas', lastName: 'Lerner', tScore: 1200 },
            { firstName: 'Sarah', lastName: 'Schlau', tScore: 1500 },
            { firstName: 'Julian', lastName: 'Jung', tScore: 800 },
        ];

        for (const student of demoStudents) {
            await this.prisma.client.user.create({
                data: {
                    email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}.${demoClass.id.substring(0, 4)}@demo.tl`,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    role: UserRole.student,
                    classId: demoClass.id,
                    tScore: student.tScore,
                    isActive: true,
                    // Students in demo classes would have pre-generated passwords
                    studentPasswordPlain: 'start123',
                    studentPasswordHash: '$2b$10$EixZA5VK1pS77e2sD3n7nuV.X0.35Y.9f1V/l.1.Y.1.Y.1.Y.1.Y', // bcrypt(start123)
                },
            });
        }

        return demoClass;
    }
}
