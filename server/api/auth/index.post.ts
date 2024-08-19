import { serverSupabaseClient } from '#supabase/server';
import { H3Event, createError, sendError } from 'h3';

interface AuthPayload {
  email: string;
}

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient(event);
  const { email }: AuthPayload = await readBody(event);

  try {
    const defaultPassword = '123456'; // Default password

    // Attempt to sign up the user
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email,
      password: defaultPassword,
    });

    if (signUpError) {
      // If the user already exists, handle it by attempting to sign them in
      if (signUpError.message.includes('already registered')) {
        console.log('girdi')
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email,
          password: defaultPassword,
        });

        if (signInError) {
          // Return a 401 status code for sign-in failure
          return sendError(event, createError({
            statusCode: 401,
            statusMessage: 'Sign-in failed. Please check your credentials and try again.',
          }));
        }

        // Return a 200 status code for successful sign-in
        return {
          success: true,
          message: 'User signed in successfully',
          user: signInData.user,
        };
      } else {
        // For other signup errors, return a 400 status code
        return sendError(event, createError({
          statusCode: 400,
          statusMessage: signUpError.message,
        }));
      }
    }

    // Return a 201 status code for successful sign-up
    return {
      success: true,
      message: 'User signed up and signed in successfully',
      user: signUpData.user,
    };

  } catch (error) {
    // Return a 500 status code for any other errors
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
});
