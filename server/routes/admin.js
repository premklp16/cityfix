const express = require('express');
const router = express.Router();
const { 
  getAnalytics, 
  assignReport, 
  getUsers, 
  updateUserRole, 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  assignOfficerToDepartment,
  getOfficersByDepartment,
  removeOfficerFromDepartment
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

router.use(auth);

router.get('/analytics', authorize('admin'), getAnalytics);
router.post('/assign-report', authorize('admin'), assignReport);

router.route('/users')
  .get(authorize('admin'), getUsers);
router.put('/users/:id/role', authorize('admin'), updateUserRole);

router.route('/departments')
  .get(authorize('officer', 'admin'), getDepartments)
  .post(authorize('admin'), createDepartment);
  
router.route('/departments/:id')
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

// Officer management routes
router.post('/officers/assign-department', authorize('admin'), assignOfficerToDepartment);
router.get('/departments/:departmentId/officers', authorize('admin', 'officer'), getOfficersByDepartment);
router.post('/officers/remove-department', authorize('admin'), removeOfficerFromDepartment);

module.exports = router;
