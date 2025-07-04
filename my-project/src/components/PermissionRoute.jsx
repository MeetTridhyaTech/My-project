import UnauthorizedAccess from "./UnauthorizedAccess";

export default function PermissionRoute({ permission, children }) {
  const permissions = JSON.parse(localStorage.getItem('permission')) || [];

  if (!permissions.includes(permission)) {
    return <UnauthorizedAccess />;
  }

  return children;
}

