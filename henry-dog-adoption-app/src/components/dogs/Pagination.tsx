import React from "react";
interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  setPage,
  totalPages,
}) => {
  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
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
};

export default Pagination;
