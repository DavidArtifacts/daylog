'use server';

import { prisma } from '@/prisma/client';
import { hashPassword } from '@/utils/crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InitFormState, InitSignupFormSchema } from './definitions';

export async function validateAdminUserExists() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) redirect('/login');
}

export async function signupInit(state: InitFormState, formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = InitSignupFormSchema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      data: data,
      success: false,
    };
  }

  try {
    // Check if the admin user already exists
    const user = await prisma.user.findUnique({
      where: {
        email: result.data.email,
        AND: { role: 'admin' },
      },
    });
    if (user) {
      return {
        message: 'User already exists.',
        success: false,
      };
    }

    const hashedPassword = hashPassword(result.data.password);
    result.data.password = hashedPassword;

    await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
        terms: 'accept',
        role: 'admin',
      },
    });

    revalidatePath('/', 'layout');

    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      data: result.data,
      message: 'An error occurred while creating your admin account.',
    };
  }
}
