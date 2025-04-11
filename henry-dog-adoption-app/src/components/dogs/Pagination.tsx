interface PaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export default function Pagination({
  page,
  setPage,
  totalPages,
}: PaginationProps) {
  const handlePrevious = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };
  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <button onClick={handlePrevious} disabled={page === 0}>
        Previous
      </button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <button onClick={handleNext} disabled={page >= totalPages - 1}>
        Next
      </button>
    </div>
  );
}
