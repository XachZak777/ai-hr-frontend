import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listMyJobs } from '../../api/jobs';
import { notify } from '../../utils/notifications';
import CandidatesTab from '../employer-dashboard/components/CandidatesTab';

export default function EmployerCandidatesPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const initialJobId = searchParams.get('jobId') ?? '';

  useEffect(() => {
    listMyJobs({ size: 50 })
      .then((page) => setJobs(page.content ?? []))
      .catch(() => notify('Failed to load jobs.', 'error'));
  }, []);

  return (
    <main className="page dashboard">
      <CandidatesTab jobs={jobs} initialJobId={initialJobId} />
    </main>
  );
}
