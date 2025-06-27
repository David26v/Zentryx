import express from 'express';
import {
  UserCreate,
  UserDetail,
  changeUserDetailInfo,
  changeUserInfo,
  deleteUserAccount,
  getAllUsers,
  getAvatar,
  getUser,
  getUserRole,
  uploadAvatar,
} from '../controllers/user.controller';
import uploadAvatarMiddleware from '../middleware/uploadAvatar';


const router = express.Router();

// GET routes
router.get('/role/:username', getUserRole);
router.get('/get-all-user', getAllUsers);
router.get('/get-user/:username', getUser);
router.get('/get-user-details/:user_id', UserDetail);

// POST and PUT
router.post('/change-account', changeUserInfo);
router.post('/create-user', UserCreate);
router.put('/change-info', changeUserDetailInfo);

//Upload Avatar
router.post('/upload-avatar', uploadAvatarMiddleware.single("avatar"), uploadAvatar);
router.get('/avatar/:id', getAvatar);

// DELETE
router.delete('/delete-account', deleteUserAccount);

export default router;
