
import { useParams } from 'react-router-dom';

const Dashboard = () => {
    const { workspaceId } = useParams();


    return (
        <h1>Tổng quan không gian làm việc: {workspaceId}</h1>
    );
};

export default Dashboard;