import type { APIRoute } from 'astro';
import { handleApiRequest } from '../../server/http/router';

export const ALL: APIRoute = async (context) => {
  return handleApiRequest(context.request, context.locals, context.url.pathname);
};
