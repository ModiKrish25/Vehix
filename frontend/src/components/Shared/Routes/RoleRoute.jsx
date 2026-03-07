import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ roles }) => {
    const { userInfo } = useSelector((state) => state.auth);

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(userInfo.role)) {
        return <Navigate to="/" replace />; // Or to a 'Forbidden' page
    }

    return <Outlet />;
};

export default RoleRoute;
