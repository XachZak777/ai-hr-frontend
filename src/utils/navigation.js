export function navigateAfterLogin(role, navigate) {
  if (role === 'admin') {
    navigate('/admin-dashboard');
  } else if (role === 'employer') {
    navigate('/employer-dashboard');
  } else {
    navigate('/employee-dashboard');
  }
}
