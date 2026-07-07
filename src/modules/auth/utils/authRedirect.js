function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

function extractRoleFromData(data) {
  const roles = data?.user?.roles || data?.roles || data?.authorities;
  if (Array.isArray(roles) && roles.length > 0) {
    const firstRole = roles[0];
    if (typeof firstRole === 'string') {
      return firstRole;
    }

    if (firstRole && typeof firstRole === 'object') {
      return firstRole.role || firstRole.authority || firstRole.name || '';
    }
  }

  return (
    data?.role ||
    data?.user?.role ||
    data?.account?.role ||
    data?.userInfo?.role ||
    data?.user?.authorities?.[0]?.authority ||
    data?.authorities?.[0]?.authority ||
    ''
  );
}

export function getPostLoginPath(responseBody) {
  const role = normalizeRole(extractRoleFromData(responseBody?.data || responseBody));
  if (role.includes('ADMIN')) {
    return '/admin';
  }

  return '/dashboard';
}
