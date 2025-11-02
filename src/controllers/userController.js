import { getUserById } from '../services/authService.js';
import { sanitizeUser, createSuccessResponse, createErrorResponse } from '../utils/helpers.js';

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found', 404)
      );
    }

    return res.json(
      createSuccessResponse(sanitizeUser(user), 'User retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

