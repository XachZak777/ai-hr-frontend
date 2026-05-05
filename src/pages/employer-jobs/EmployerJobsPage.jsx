import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyJobs } from '../../api/jobs';
import { notify } from '../../utils/notifications';
import JobPostsTab from '../employer-dashboard/components/JobPostsTab';

export default function EmployerJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => setJobs(page.content ?? []))
      .catch(() => notify('Failed to load jobs.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="page dashboard">
        <p className="muted">Loading jobs...</p>
      </main>
    );
  }

  return (
    <main className="page dashboard">
      <JobPostsTab
        jobs={jobs}
        onJobsChange={setJobs}
        onViewApplicants={(jobId) => navigate(`/employer-candidates?jobId=${jobId}`)}
      />
    </main>
  );
}
