import 'dotenv/config';
import jws from 'jsonwebtoken';

interface IError {
  statusCode?: number;
}

export const isAuth = (req: any, res, next: any) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated') as IError;
    error.statusCode = 401;
    return res.status(401).json({
			message: 'You do not have permissions to do this',
		});
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jws.verify(token, process.env.SECRET!);
  } catch (err) {
    if (!decodedToken) {
      const error = new Error('Not authenticated.') as IError;
      error.statusCode = 401;
      return res.status(401).json({
				message: 'You do not have permissions to do this',
			});
    }
  }
  req.userId = decodedToken.userId;
  next();
};
